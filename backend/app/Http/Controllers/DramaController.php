<?php

namespace App\Http\Controllers;

use App\Models\Drama;
use App\Models\Episode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class DramaController extends Controller
{
    public function index()
    {
        $dramas = Drama::withCount('episodes')->get()->map(function($drama) {
            return [
                'id' => $drama->id,
                'title' => $drama->title,
                'titleKhmer' => $drama->titleKhmer,
                'description' => $drama->description,
                'poster' => $drama->poster,
                'genre' => $drama->genre,
                'trending' => (bool)$drama->trending,
                'status' => $drama->status,
                'totalEpisodes' => (int)$drama->totalEpisodes,
                'source' => $drama->source,
                'year' => $drama->year ?? '2025',
                'rating' => $drama->rating ?? '8.0',
                'views' => (int)$drama->views,
                'episodeCount' => $drama->episodes_count,
                'createdAt' => strtotime($drama->created_at),
            ];
        });

        return response()->json($dramas->sortByDesc('createdAt')->values()->all());
    }

    public function show($id)
    {
        $drama = Drama::find($id);
        if (!$drama) {
            return response()->json(['detail' => 'Drama not found'], 404);
        }
        // Increment views on watch details load
        $drama->increment('views');
        
        return response()->json($this->getDramaDetails($id));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'titleKhmer' => 'nullable|string',
            'description' => 'required|string',
            'poster' => 'nullable|string',
            'genre' => 'nullable|string',
            'trending' => 'nullable|boolean',
            'status' => 'nullable|string',
            'totalEpisodes' => 'nullable|integer',
            'source' => 'nullable|string',
            'year' => 'nullable|string',
            'rating' => 'nullable|string',
            'episodes' => 'nullable|array'
        ]);

        $dramaId = $request->input('id') ?: (string)Str::uuid();
        $trending = $request->input('trending', false);

        $drama = Drama::create([
            'id' => $dramaId,
            'title' => $data['title'],
            'titleKhmer' => $data['titleKhmer'] ?? '',
            'description' => $data['description'],
            'poster' => ($request->filled('poster')) ? $data['poster'] : "https://picsum.photos/seed/{$dramaId}/300/450",
            'genre' => $data['genre'] ?? 'Action',
            'trending' => $trending,
            'status' => $data['status'] ?? '',
            'totalEpisodes' => $data['totalEpisodes'] ?? 0,
            'source' => $data['source'] ?? '',
            'year' => $data['year'] ?? '2025',
            'rating' => $data['rating'] ?? '8.0',
            'views' => 0
        ]);

        if (isset($data['episodes']) && is_array($data['episodes'])) {
            foreach ($data['episodes'] as $index => $epData) {
                $epId = $epData['id'] ?? ('ep_' . substr((string)Str::uuid(), 0, 8));
                $epNum = $epData['episode'] ?? ($index + 1);
                $drama->episodes()->create([
                    'id' => $epId,
                    'episode' => $epNum,
                    'title' => $epData['title'] ?? "Episode {$epNum}",
                    'videoUrl' => $epData['videoUrl'] ?? ''
                ]);
            }
        }

        return response()->json($this->getDramaDetails($dramaId), 201);
    }

    public function update(Request $request, $id)
    {
        $drama = Drama::find($id);
        if (!$drama) {
            return response()->json(['detail' => 'Drama not found'], 404);
        }

        $data = $request->validate([
            'title' => 'sometimes|string',
            'titleKhmer' => 'sometimes|nullable|string',
            'description' => 'sometimes|string',
            'poster' => 'sometimes|nullable|string',
            'genre' => 'sometimes|nullable|string',
            'trending' => 'sometimes|boolean',
            'status' => 'sometimes|nullable|string',
            'totalEpisodes' => 'sometimes|integer',
            'source' => 'sometimes|nullable|string',
            'year' => 'sometimes|nullable|string',
            'rating' => 'sometimes|nullable|string',
            'views' => 'sometimes|integer',
        ]);

        $drama->update($data);

        return response()->json($this->getDramaDetails($id));
    }

    public function destroy($id)
    {
        $drama = Drama::find($id);
        if (!$drama) {
            return response()->json(['detail' => 'Drama not found'], 404);
        }
        $drama->delete();
        return response()->json(['deleted' => true]);
    }

    public function scrape(Request $request)
    {
        $request->validate([
            'url' => 'required|url',
        ]);

        $url = $request->input('url');

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ])->get($url);

            if (!$response->successful()) {
                return response()->json(['detail' => 'Failed to fetch the webpage. Status code: ' . $response->status()], 400);
            }

            $html = $response->body();

            // Determine if single post page or listing page
            // Post page pattern contains /20XX/XX/ or ends in .html
            $isPostPage = preg_match('/\/20\d{2}\/\d{2}\/.*\.html/i', $url) || preg_match('/\.html/i', $url);

            if ($isPostPage) {
                $res = $this->parseAndSaveDrama($html, $url);
                if (!$res) {
                    return response()->json(['detail' => 'Could not find any episode videos on this page.'], 400);
                }
                return response()->json([
                    'id' => $res['id'],
                    'title' => $res['title'],
                    'episodeCount' => $res['episodeCount'],
                    'status' => $res['status']
                ], 201);
            } else {
                // Listing page: parse all links matching blogger post pattern
                // Matches either: https://www.kh7hd.cc/20XX/XX/name.html or relative /20XX/XX/name.html
                preg_match_all('/href=["\']((?:https?:\/\/[a-z0-9.-]+)?\/20\d{2}\/\d{2}\/[^"\']+\.html)["\']/i', $html, $matches);
                $links = array_unique($matches[1]);
                $parsedHost = parse_url($url);
                $baseHost = ($parsedHost['scheme'] ?? 'https') . '://' . ($parsedHost['host'] ?? 'www.kh7hd.cc');

                $imported = [];
                $limit = 20; // Limit bulk scraping iterations to avoid gateway timeouts
                $count = 0;

                foreach ($links as $link) {
                    if ($count >= $limit) break;

                    // Resolve relative link
                    if (strpos($link, 'http') !== 0) {
                        $link = rtrim($baseHost, '/') . '/' . ltrim($link, '/');
                    }

                    try {
                        $subResponse = Http::withHeaders([
                            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        ])->get($link);

                        if ($subResponse->successful()) {
                            $subHtml = $subResponse->body();
                            $res = $this->parseAndSaveDrama($subHtml, $link);
                            if ($res) {
                                $imported[] = $res;
                                $count++;
                            }
                        }
                    } catch (\Exception $subEx) {
                        continue;
                    }
                }

                if (empty($imported)) {
                    return response()->json(['detail' => 'No importable drama links found on this page.'], 400);
                }

                return response()->json([
                    'isBulk' => true,
                    'imported' => $imported,
                    'importedCount' => count($imported)
                ], 201);
            }

        } catch (\Exception $e) {
            return response()->json(['detail' => 'Scraper error: ' . $e->getMessage()], 500);
        }
    }

    private function parseAndSaveDrama($html, $url)
    {
        // Extract title
        preg_match('/<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']*)["\']/i', $html, $titleMatch);
        $title = !empty($titleMatch[1]) ? $titleMatch[1] : '';
        if (empty($title)) {
            preg_match('/<h3[^>]*class=["\']fst-italic["\'][^>]*>(.*?)<\/h3>/i', $html, $h3Match);
            $title = !empty($h3Match[1]) ? strip_tags($h3Match[1]) : 'Scraped Drama';
        }
        $title = preg_replace('/\[\d+\.END\]/i', '', $title);
        $title = preg_replace('/\[\d+\.EP\]/i', '', $title);
        $title = trim($title);

        // Check if drama with this exact title already exists to avoid duplicates
        $existing = Drama::where('title', $title)->first();
        if ($existing) {
            return [
                'id' => $existing->id,
                'title' => $existing->title,
                'episodeCount' => $existing->episodes()->count(),
                'status' => 'already_exists'
            ];
        }

        // Extract description
        preg_match('/<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']*)["\']/i', $html, $descMatch);
        $description = !empty($descMatch[1]) ? $descMatch[1] : 'No description.';

        // Extract poster
        preg_match('/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']*)["\']/i', $html, $posterMatch);
        $poster = !empty($posterMatch[1]) ? $posterMatch[1] : 'https://picsum.photos/300/450';

        // Extract episodes
        // Format 1: const videos = [...]
        preg_match('/const\s+videos\s*=\s*(\[[\s\S]*?\]);/', $html, $videosMatch);
        $episodes = [];
        if (!empty($videosMatch[1])) {
            $videoArrayStr = $videosMatch[1];
            preg_match_all('/\{[\s\S]*?\}/', $videoArrayStr, $objMatches);
            foreach ($objMatches[0] as $index => $objStr) {
                preg_match('/["\']?title["\']?\s*:\s*["\'](.*?)["\']/i', $objStr, $tMatch);
                preg_match('/["\']?(?:file|videoUrl)["\']?\s*:\s*["\'](.*?)["\']/i', $objStr, $fMatch);
                
                $epTitle = !empty($tMatch[1]) ? $tMatch[1] : ("Episode " . ($index + 1));
                $epFile = !empty($fMatch[1]) ? $fMatch[1] : "";
                
                if ($epFile) {
                    $episodes[] = [
                        'id' => 'ep_' . time() . '_' . $index,
                        'episode' => $index + 1,
                        'title' => $epTitle,
                        'videoUrl' => $epFile,
                    ];
                }
            }
        }

        // Format 2 (playlists): const playlists = [...]
        if (empty($episodes)) {
            preg_match('/const\s+playlists\s*=\s*(\[[\s\S]*?\]);/', $html, $playlistsMatch);
            if (!empty($playlistsMatch[1])) {
                $playlistArrayStr = $playlistsMatch[1];
                preg_match_all('/\{[\s\S]*?\}/', $playlistArrayStr, $objMatches);
                foreach ($objMatches[0] as $index => $objStr) {
                    preg_match('/["\']?file["\']?\s*:\s*["\'](.*?)["\']/i', $objStr, $fMatch);
                    $epFile = !empty($fMatch[1]) ? $fMatch[1] : "";
                    if ($epFile) {
                        $episodes[] = [
                            'id' => 'ep_' . time() . '_' . $index,
                            'episode' => $index + 1,
                            'title' => "Episode " . ($index + 1),
                            'videoUrl' => $epFile,
                        ];
                    }
                }
            }
        }

        // Format 3 (single video-source): data-video-source="..."
        if (empty($episodes)) {
            preg_match('/data-video-source=["\']([^"\']*)["\']/i', $html, $sourceMatch);
            if (!empty($sourceMatch[1])) {
                $episodes[] = [
                    'id' => 'ep_' . time() . '_0',
                    'episode' => 1,
                    'title' => 'Full Movie',
                    'videoUrl' => $sourceMatch[1],
                ];
            }
        }

        if (empty($episodes)) {
            return null;
        }

        // Save to database
        $dramaId = (string)Str::uuid();
        $drama = Drama::create([
            'id' => $dramaId,
            'title' => $title,
            'titleKhmer' => '',
            'description' => $description,
            'poster' => $poster,
            'genre' => 'Action',
            'trending' => true,
            'status' => '',
            'totalEpisodes' => count($episodes),
            'source' => '',
            'year' => '2025',
            'rating' => '8.5',
            'views' => 0
        ]);

        foreach ($episodes as $ep) {
            $drama->episodes()->create([
                'id' => $ep['id'],
                'episode' => $ep['episode'],
                'title' => $ep['title'],
                'videoUrl' => $ep['videoUrl']
            ]);
        }

        return [
            'id' => $drama->id,
            'title' => $drama->title,
            'episodeCount' => count($episodes),
            'status' => 'imported'
        ];
    }

    private function getDramaDetails($id)
    {
        $drama = Drama::with('episodes')->find($id);
        if (!$drama) return null;
        return [
            'id' => $drama->id,
            'title' => $drama->title,
            'titleKhmer' => $drama->titleKhmer,
            'description' => $drama->description,
            'poster' => $drama->poster,
            'genre' => $drama->genre,
            'trending' => (bool)$drama->trending,
            'status' => $drama->status,
            'totalEpisodes' => (int)$drama->totalEpisodes,
            'source' => $drama->source,
            'year' => $drama->year ?? '2025',
            'rating' => $drama->rating ?? '8.0',
            'views' => (int)$drama->views,
            'createdAt' => strtotime($drama->created_at),
            'episodes' => $drama->episodes->map(function($ep) {
                return [
                    'id' => $ep->id,
                    'drama_id' => $ep->drama_id,
                    'episode' => $ep->episode,
                    'title' => $ep->title,
                    'videoUrl' => $ep->videoUrl,
                    'createdAt' => strtotime($ep->created_at),
                ];
            })
        ];
    }
}
