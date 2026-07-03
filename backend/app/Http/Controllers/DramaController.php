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
        // Auto-clean bad descriptions containing script tags or playlist code
        $badDramas = Drama::where('description', 'like', '%const %')
            ->orWhere('description', 'like', '%playlists%')
            ->orWhere('description', 'like', '%videos%')
            ->get();
        foreach ($badDramas as $bd) {
            $clean = preg_replace('/<script\b[^>]*>([\s\S]*?)<\/script>/i', '', $bd->description);
            $clean = preg_replace('/const\s+(?:playlists|videos|subtitles)[\s\S]*/i', '', $clean);
            $clean = strip_tags($clean);
            $clean = preg_replace('/\s+/', ' ', $clean);
            $clean = trim($clean);
            if (empty($clean)) {
                $clean = 'No description available.';
            }
            $bd->update(['description' => $clean]);
        }

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
            'genre' => 'nullable|string',
        ]);

        $url = $request->input('url');
        $genre = $request->input('genre', 'Action');

        try {
            $imported = [];
            $isBloggerFeed = false;
            $isPostPage = preg_match('/\/20\d{2}\/\d{2}\/.*\.html/i', $url) || preg_match('/\.html/i', $url);

            if (!$isPostPage) {
                // Listing page: construct Blogger feed URL to fetch bulk entries extremely fast
                $parsedUrl = parse_url($url);
                $host = $parsedUrl['host'] ?? '';
                $path = $parsedUrl['path'] ?? '';

                if ($host && (strpos($host, 'kh7hd') !== false || strpos($host, 'blogspot') !== false)) {
                    $label = null;
                    if (preg_match('/\/search\/label\/([^?#\/]+)/i', $path, $labelMatch)) {
                        $label = urldecode($labelMatch[1]);
                    }

                    $feedUrl = "https://{$host}/feeds/posts/default";
                    if ($label) {
                        $feedUrl .= "/-/" . urlencode($label);
                    }
                    $feedUrl .= "?alt=json&max-results=150";

                    try {
                        $feedResponse = Http::withHeaders([
                            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                        ])->timeout(20)->get($feedUrl);

                        if ($feedResponse->successful()) {
                            $feedData = json_decode($feedResponse->body(), true);
                            $entries = $feedData['feed']['entry'] ?? [];
                            
                            foreach ($entries as $entry) {
                                $title = $entry['title']['$t'] ?? '';
                                $content = $entry['content']['$t'] ?? '';
                                
                                // Extract release year from HTML content to filter
                                preg_match('/data-release=["\'](\d{4})["\']/i', $content, $yearMatch);
                                $year = !empty($yearMatch[1]) ? $yearMatch[1] : '2025';
                                
                                if ($year !== '2025' && $year !== '2026') {
                                    continue; // Skip older years
                                }

                                $link = '';
                                if (!empty($entry['link'])) {
                                    foreach ($entry['link'] as $l) {
                                        if (($l['rel'] ?? '') === 'alternate') {
                                            $link = $l['href'] ?? '';
                                            break;
                                        }
                                    }
                                }

                                $poster = '';
                                if (!empty($entry['media$thumbnail']['url'])) {
                                    $poster = str_replace('/s72-c/', '/s1600/', $entry['media$thumbnail']['url']);
                                }

                                if ($title && $content) {
                                    $res = $this->parseAndSaveDramaFromFeed($title, $content, $link, $poster, $genre);
                                    if ($res) {
                                        $imported[] = $res;
                                    }
                                }
                            }
                            $isBloggerFeed = true;
                        }
                    } catch (\Exception $feedEx) {
                        $isBloggerFeed = false;
                    }
                }
            }

            if ($isBloggerFeed) {
                if (empty($imported)) {
                    return response()->json(['detail' => 'No new importable drama links found on this Blogger feed.'], 400);
                }
                return response()->json([
                    'isBulk' => true,
                    'imported' => $imported,
                    'importedCount' => count($imported)
                ], 201);
            }

            // Fallback: original page scraping (single or HTML list crawling)
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ])->get($url);

            if (!$response->successful()) {
                return response()->json(['detail' => 'Failed to fetch the webpage. Status code: ' . $response->status()], 400);
            }

            $html = $response->body();

            if ($isPostPage) {
                $res = $this->parseAndSaveDrama($html, $url, $genre);
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
                preg_match_all('/href=["\']((?:https?:\/\/[a-z0-9.-]+)?\/20\d{2}\/\d{2}\/[^"\']+\.html)["\']/i', $html, $matches);
                $links = array_unique($matches[1]);
                $parsedHost = parse_url($url);
                $baseHost = ($parsedHost['scheme'] ?? 'https') . '://' . ($parsedHost['host'] ?? 'www.kh7hd.cc');

                $limit = 20;
                $count = 0;

                foreach ($links as $link) {
                    if ($count >= $limit) break;

                    if (strpos($link, 'http') !== 0) {
                        $link = rtrim($baseHost, '/') . '/' . ltrim($link, '/');
                    }

                    try {
                        $subResponse = Http::withHeaders([
                            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        ])->get($link);

                        if ($subResponse->successful()) {
                            $subHtml = $subResponse->body();
                            
                            // Check release year
                            preg_match('/data-release=["\'](\d{4})["\']/i', $subHtml, $yearMatch);
                            $year = !empty($yearMatch[1]) ? $yearMatch[1] : '2025';

                            if ($year === '2025' || $year === '2026') {
                                $res = $this->parseAndSaveDrama($subHtml, $link, $genre);
                                if ($res) {
                                    $imported[] = $res;
                                    $count++;
                                }
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

    private function parseAndSaveDrama($html, $url, $genre = 'Action')
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
        $episodes = [];

        // Format 1: const videos = [...]
        preg_match('/const\s+videos\s*=\s*(\[[\s\S]*?\]);/', $html, $videosMatch);
        if (!empty($videosMatch[1])) {
            $videoArrayStr = $videosMatch[1];
            // Unescape
            $videoArrayStr = str_replace(['\"', "\'", '\/'], ['"', "'", '/'], $videoArrayStr);
            // Strip subtitles
            $videoArrayStr = preg_replace('/subtitles\s*:\s*\[[\s\S]*?\]/i', '', $videoArrayStr);

            preg_match_all('/\{[\s\S]*?\}/', $videoArrayStr, $objMatches);
            foreach ($objMatches[0] as $index => $objStr) {
                preg_match('/["\']?title["\']?\s*:\s*["\'](.*?)["\']/i', $objStr, $tMatch);
                preg_match('/["\']?(?:file|videoUrl)["\']?\s*:\s*["\'](.*?)["\']/i', $objStr, $fMatch);
                
                $epTitle = !empty($tMatch[1]) ? $tMatch[1] : ("Episode " . ($index + 1));
                $epFile = !empty($fMatch[1]) ? $fMatch[1] : "";
                
                if ($epFile) {
                    $episodes[] = [
                        'id' => 'ep_' . (string)Str::uuid(),
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
                // Unescape
                $playlistArrayStr = str_replace(['\"', "\'", '\/'], ['"', "'", '/'], $playlistArrayStr);
                // Strip subtitles
                $playlistArrayStr = preg_replace('/subtitles\s*:\s*\[[\s\S]*?\]/i', '', $playlistArrayStr);

                preg_match_all('/\{[\s\S]*?\}/', $playlistArrayStr, $objMatches);
                foreach ($objMatches[0] as $index => $objStr) {
                    preg_match('/["\']?file["\']?\s*:\s*["\'](.*?)["\']/i', $objStr, $fMatch);
                    $epFile = !empty($fMatch[1]) ? $fMatch[1] : "";
                    if ($epFile) {
                        $episodes[] = [
                            'id' => 'ep_' . (string)Str::uuid(),
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
                    'id' => 'ep_' . (string)Str::uuid(),
                    'episode' => 1,
                    'title' => 'Full Movie',
                    'videoUrl' => $sourceMatch[1],
                ];
            }
        }

        if (empty($episodes)) {
            return null;
        }

        // Extract release year
        preg_match('/data-release=["\'](\d{4})["\']/i', $html, $yearMatch);
        $year = !empty($yearMatch[1]) ? $yearMatch[1] : '2025';

        // Save to database
        $dramaId = (string)Str::uuid();
        $drama = Drama::create([
            'id' => $dramaId,
            'title' => $title,
            'titleKhmer' => '',
            'description' => $description,
            'poster' => $poster,
            'genre' => $genre,
            'trending' => true,
            'status' => '',
            'totalEpisodes' => count($episodes),
            'source' => '',
            'year' => $year,
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

    private function parseAndSaveDramaFromFeed($title, $contentHtml, $url, $feedPoster, $genre = 'Action')
    {
        $title = preg_replace('/\[\d+\.END\]/i', '', $title);
        $title = preg_replace('/\[\d+\.EP\]/i', '', $title);
        $title = trim($title);

        // Check duplicate
        $existing = Drama::where('title', $title)->first();
        if ($existing) {
            return [
                'id' => $existing->id,
                'title' => $existing->title,
                'episodeCount' => $existing->episodes()->count(),
                'status' => 'already_exists'
            ];
        }

        // Extract description (remove script tags completely first)
        $cleanHtml = preg_replace('/<script\b[^>]*>([\s\S]*?)<\/script>/i', '', $contentHtml);
        $description = strip_tags($cleanHtml);
        $description = preg_replace('/\s+/', ' ', $description);
        $description = trim(mb_substr($description, 0, 500));
        if (empty($description)) {
            $description = 'No description available.';
        }

        // Extract poster
        $poster = $feedPoster;
        if (empty($poster)) {
            preg_match('/src=["\']([^"\']*(?:jpg|jpeg|png|webp|gif))["\']/i', $contentHtml, $imgMatch);
            $poster = !empty($imgMatch[1]) ? $imgMatch[1] : 'https://picsum.photos/300/450';
        }

        // Extract episodes
        $episodes = [];

        // Format 1: const videos = [...]
        preg_match('/const\s+videos\s*=\s*(\[[\s\S]*?\]);/', $contentHtml, $videosMatch);
        if (!empty($videosMatch[1])) {
            $videoArrayStr = $videosMatch[1];
            // Unescape
            $videoArrayStr = str_replace(['\"', "\'", '\/'], ['"', "'", '/'], $videoArrayStr);
            // Strip subtitles
            $videoArrayStr = preg_replace('/subtitles\s*:\s*\[[\s\S]*?\]/i', '', $videoArrayStr);

            preg_match_all('/\{[\s\S]*?\}/', $videoArrayStr, $objMatches);
            foreach ($objMatches[0] as $index => $objStr) {
                preg_match('/["\']?title["\']?\s*:\s*["\'](.*?)["\']/i', $objStr, $tMatch);
                preg_match('/["\']?(?:file|videoUrl)["\']?\s*:\s*["\'](.*?)["\']/i', $objStr, $fMatch);
                
                $epTitle = !empty($tMatch[1]) ? $tMatch[1] : ("Episode " . ($index + 1));
                $epFile = !empty($fMatch[1]) ? $fMatch[1] : "";
                
                if ($epFile) {
                    $episodes[] = [
                        'id' => 'ep_' . (string)Str::uuid(),
                        'episode' => $index + 1,
                        'title' => $epTitle,
                        'videoUrl' => $epFile,
                    ];
                }
            }
        }

        // Format 2: const playlists = [...]
        if (empty($episodes)) {
            preg_match('/const\s+playlists\s*=\s*(\[[\s\S]*?\]);/', $contentHtml, $playlistsMatch);
            if (!empty($playlistsMatch[1])) {
                $playlistArrayStr = $playlistsMatch[1];
                // Unescape
                $playlistArrayStr = str_replace(['\"', "\'", '\/'], ['"', "'", '/'], $playlistArrayStr);
                // Strip subtitles
                $playlistArrayStr = preg_replace('/subtitles\s*:\s*\[[\s\S]*?\]/i', '', $playlistArrayStr);

                preg_match_all('/\{[\s\S]*?\}/', $playlistArrayStr, $objMatches);
                foreach ($objMatches[0] as $index => $objStr) {
                    preg_match('/["\']?file["\']?\s*:\s*["\'](.*?)["\']/i', $objStr, $fMatch);
                    $epFile = !empty($fMatch[1]) ? $fMatch[1] : "";
                    if ($epFile) {
                        $episodes[] = [
                            'id' => 'ep_' . (string)Str::uuid(),
                            'episode' => $index + 1,
                            'title' => "Episode " . ($index + 1),
                            'videoUrl' => $epFile,
                        ];
                    }
                }
            }
        }

        // Format 3: data-video-source="..."
        if (empty($episodes)) {
            preg_match('/data-video-source=["\']([^"\']*)["\']/i', $contentHtml, $sourceMatch);
            if (!empty($sourceMatch[1])) {
                $episodes[] = [
                    'id' => 'ep_' . (string)Str::uuid(),
                    'episode' => 1,
                    'title' => 'Full Movie',
                    'videoUrl' => $sourceMatch[1],
                ];
            }
        }

        if (empty($episodes)) {
            return null;
        }

        // Extract release year
        preg_match('/data-release=["\'](\d{4})["\']/i', $contentHtml, $yearMatch);
        $year = !empty($yearMatch[1]) ? $yearMatch[1] : '2025';

        // Save
        $dramaId = (string)Str::uuid();
        $drama = Drama::create([
            'id' => $dramaId,
            'title' => $title,
            'titleKhmer' => '',
            'description' => $description,
            'poster' => $poster,
            'genre' => $genre,
            'trending' => true,
            'status' => '',
            'totalEpisodes' => count($episodes),
            'source' => '',
            'year' => $year,
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
