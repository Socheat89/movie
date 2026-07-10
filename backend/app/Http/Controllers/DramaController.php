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

    public function bulkUpdateGenre(Request $request)
    {
        $data = $request->validate([
            'genre' => 'required|string',
            'assigned_ids' => 'present|array',
            'assigned_ids.*' => 'string'
        ]);

        $genre = $data['genre'];
        $assignedIds = $data['assigned_ids'];

        // Update dramas previously in this genre but no longer selected to be empty
        Drama::where('genre', $genre)->whereNotIn('id', $assignedIds)->update(['genre' => '']);

        // Update selected dramas to be in this genre
        if (!empty($assignedIds)) {
            Drama::whereIn('id', $assignedIds)->update(['genre' => $genre]);
        }

        return response()->json(['success' => true]);
    }

    public function scrape(Request $request)
    {
        $request->validate([
            'url' => 'required|url',
        ]);

        $url = $request->input('url');

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
                                    $res = $this->parseAndSaveDramaFromFeed($title, $content, $link, $poster);
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

            // ── TMDB routing ────────────────────────────────
            $parsedHost = parse_url($url, PHP_URL_HOST) ?? '';
            if (strpos($parsedHost, 'themoviedb.org') !== false) {
                // Single movie or TV show page
                if (preg_match('#/(movie|tv)/(\d+)#', $url, $tmdbMatch)) {
                    return $this->scrapeTmdb($url, $tmdbMatch[1], $tmdbMatch[2]);
                }
                // List / discover page – bulk import
                return $this->scrapeTmdbList($url);
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
                                $res = $this->parseAndSaveDrama($subHtml, $link);
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
            'genre' => 'Action',
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

    private function parseAndSaveDramaFromFeed($title, $contentHtml, $url, $feedPoster)
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
            'genre' => 'Action',
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

    public function scrapePreview(Request $request)
    {
        $request->validate([
            'url' => 'required|url',
        ]);

        $url = $request->input('url');

        try {
            $parsedUrl = parse_url($url);
            $host = $parsedUrl['host'] ?? '';

            if (strpos($host, 'khdiamond.net') !== false) {
                // KhDiamond preview parser
                $detectedGenre = 'Action';
                $path = trim($parsedUrl['path'] ?? '', '/');
                $segments = explode('/', $path);

                if (count($segments) >= 2 && $segments[0] === 'genre') {
                    $detectedGenre = urldecode($segments[1]);
                    // Capitalize first letter of each word
                    $detectedGenre = mb_convert_case($detectedGenre, MB_CASE_TITLE, "UTF-8");
                }

                $response = Http::withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ])->timeout(20)->get($url);

                if (!$response->successful()) {
                    return response()->json(['detail' => 'Failed to retrieve the webpage. Status code: ' . $response->status()], 400);
                }

                $html = $response->body();
                $movies = [];

                // Parse post items
                preg_match_all('/<article\s+id=["\']post-(\d+)["\']\s+class=["\']item\s+([^"\']+)["\']>([\s\S]*?)<\/article>/i', $html, $articles, PREG_SET_ORDER);

                foreach ($articles as $art) {
                    $content = $art[3];

                    // URL
                    preg_match('/href=["\'](https?:\/\/khdiamond\.net\/(?:movies|tvshows|seasons|episodes)\/[^"\']+)["\']/i', $content, $hrefMatch);
                    $movieUrl = $hrefMatch[1] ?? '';
                    if (!$movieUrl) continue;

                    // Poster & Title
                    preg_match('/<img\s+[^>]*src=["\']([^"\']+)["\'][^>]*alt=["\']([^"\']+)["\']/i', $content, $imgMatch);
                    if (empty($imgMatch)) {
                        preg_match('/<img\s+[^>]*alt=["\']([^"\']+)["\'][^>]*src=["\']([^"\']+)["\']/i', $content, $imgMatch);
                    }

                    $poster = '';
                    $title = '';
                    if (!empty($imgMatch)) {
                        if (strpos($imgMatch[1], 'wp-content') !== false) {
                            $poster = $imgMatch[1];
                            $title = $imgMatch[2];
                        } else {
                            $poster = $imgMatch[2];
                            $title = $imgMatch[1];
                        }
                    }

                    if (empty($title)) {
                        preg_match('/<h3><a[^>]*>([\s\S]*?)<\/a><\/h3>/i', $content, $h3Match);
                        $title = !empty($h3Match[1]) ? trim(strip_tags($h3Match[1])) : 'Unknown Movie';
                    }

                    // Year
                    preg_match('/<span>(\d{4})<\/span>/i', $content, $yearMatch);
                    $year = $yearMatch[1] ?? '2025';

                    // Rating
                    preg_match('/<div\s+class=["\']rating["\']>([0-9.]+)<\/div>/i', $content, $ratingMatch);
                    $rating = $ratingMatch[1] ?? '8.0';

                    $movies[$movieUrl] = [
                        'title' => html_entity_decode($title, ENT_QUOTES, 'UTF-8'),
                        'url' => $movieUrl,
                        'poster' => $poster,
                        'year' => $year,
                        'rating' => $rating
                    ];
                }

                return response()->json([
                    'detectedCategory' => $detectedGenre,
                    'movies' => array_values($movies)
                ]);
            } else {
                // Fallback to old freemovies2u scraper logic
                $detectedGenre = 'Action';
                $path = trim($parsedUrl['path'] ?? '', '/');
                $segments = explode('/', $path);

                if (count($segments) === 2 && $segments[0] === 'genre') {
                    $genreName = $segments[1];
                    $detectedGenre = ucfirst($genreName);
                    
                    $indexResponse = Http::withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    ])->timeout(15)->get($url);
                    
                    if ($indexResponse->successful()) {
                        $indexHtml = $indexResponse->body();
                        if (preg_match('/href=["\']([^"\']*\bgenre\/' . preg_quote($genreName, '/') . '\/(\d+)\/?)["\']/i', $indexHtml, $idMatch)) {
                            $url = ($parsedUrl['scheme'] ?? 'https') . '://' . ($parsedUrl['host'] ?? 'freemovies2u.live') . '/' . ltrim($idMatch[1], '/');
                            $path = trim(parse_url($url, PHP_URL_PATH), '/');
                            $segments = explode('/', $path);
                        }
                    }
                }

                if (count($segments) >= 2 && $segments[0] === 'genre') {
                    $detectedGenre = ucfirst($segments[1]);
                }

                $response = Http::withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ])->timeout(15)->get($url);

                if (!$response->successful()) {
                    return response()->json(['detail' => 'Failed to retrieve the webpage. Status code: ' . $response->status()], 400);
                }

                $html = $response->body();
                $movies = [];

                preg_match_all('/<a\s+[^>]*href=["\']((?:https?:\/\/[a-z0-9.-]+)?\/movies\/[^"\']+)["\'][^>]*>([\s\S]*?)<\/a>/i', $html, $matches, PREG_SET_ORDER);

                $baseHost = ($parsedUrl['scheme'] ?? 'https') . '://' . ($parsedUrl['host'] ?? 'freemovies2u.live');

                foreach ($matches as $match) {
                    $href = $match[1];
                    $innerHtml = $match[2];
                    
                    if (strpos($href, 'http') !== 0) {
                        $href = rtrim($baseHost, '/') . '/' . ltrim($href, '/');
                    }
                    
                    preg_match('/<p[^>]*>([\s\S]*?)<\/p>/i', $innerHtml, $titleMatch);
                    if (empty($titleMatch)) {
                        preg_match('/alt=["\']([^"\']+)["\']/i', $innerHtml, $titleMatch);
                    }
                    
                    preg_match('/src=["\']([^"\']+)["\']/i', $innerHtml, $posterMatch);
                    preg_match('/class=["\']year["\'][^>]*>([\s\S]*?)<\/span>/i', $innerHtml, $yearMatch);
                    
                    $title = !empty($titleMatch[1]) ? strip_tags(trim($titleMatch[1])) : 'Unknown Movie';
                    $poster = !empty($posterMatch[1]) ? trim($posterMatch[1]) : '';
                    $year = !empty($yearMatch[1]) ? trim(strip_tags($yearMatch[1])) : '2025';
                    
                    $movies[$href] = [
                        'title' => $title,
                        'url' => $href,
                        'poster' => $poster,
                        'year' => $year
                    ];
                }

                return response()->json([
                    'detectedCategory' => $detectedGenre,
                    'movies' => array_values($movies)
                ]);
            }

        } catch (\Exception $e) {
            return response()->json(['detail' => 'Scraper preview error: ' . $e->getMessage()], 500);
        }
    }

    public function scrapeImport(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'movies' => 'required|array',
            'movies.*.title' => 'required|string',
            'movies.*.url' => 'required|url',
            'movies.*.poster' => 'nullable|string',
            'movies.*.year' => 'nullable|string',
            'movies.*.rating' => 'nullable|string',
        ]);

        $category = $request->input('category');
        $moviesList = $request->input('movies');
        $importedCount = 0;

        foreach ($moviesList as $movie) {
            $title = trim($movie['title']);
            $url = $movie['url'];

            // Check duplicate by title or source URL
            $existing = Drama::where('title', $title)->orWhere('source', $url)->first();
            if ($existing) {
                if (empty($existing->genre) || $existing->genre !== $category) {
                    $existing->update(['genre' => $category]);
                }
                continue;
            }

            try {
                if (strpos($url, 'khdiamond.net') !== false) {
                    // KhDiamond detail scraper
                    $response = Http::withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    ])->timeout(15)->get($url);

                    if (!$response->successful()) continue;

                    $html = $response->body();

                    // Description extraction:
                    // Movies use: <div itemprop="description" class="wp-content">
                    // TV Shows use: <div class="wp-content"> (no itemprop wrapper)
                    $description = 'No description available.';

                    $descPatterns = [
                        // Pattern 1: itemprop="description" wrapping a container (movie pages)
                        '/<div[^>]+itemprop=["\']description["\'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/i',
                        // Pattern 2: itemprop="description" single div (fallback)
                        '/<div[^>]+itemprop=["\']description["\'][^>]*>([\s\S]*?)<\/div>/i',
                        // Pattern 3: .wp-content div (TV show pages)
                        '/<div[^>]+class=["\'][^"\']*wp-content[^"\']*["\'][^>]*>([\s\S]*?)<\/div>/i',
                    ];

                    foreach ($descPatterns as $pattern) {
                        if (preg_match($pattern, $html, $descMatch)) {
                            $raw = strip_tags($descMatch[1]);
                            $raw = html_entity_decode($raw, ENT_QUOTES, 'UTF-8');
                            $raw = preg_replace('/\s+/', ' ', $raw);
                            $raw = trim($raw);
                            if (!empty($raw) && strlen($raw) > 10) {
                                $description = $raw;
                                break;
                            }
                        }
                    }

                    if (strpos($url, '/movies/') !== false) {
                        // Movie Page (Single Episode)
                        preg_match('/data-post=["\'](\d+)["\']/i', $html, $postIdMatch);
                        if (empty($postIdMatch)) {
                            preg_match('/postid-(\d+)/i', $html, $postIdMatch);
                        }
                        $postId = $postIdMatch[1] ?? '';
                        if (!$postId) continue;

                        // Fetch player embed url via AJAX
                        $ajaxRes = Http::asForm()->withHeaders([
                            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                            'Referer' => 'https://khdiamond.net/',
                            'Origin' => 'https://khdiamond.net'
                        ])->timeout(20)->post('https://khdiamond.net/wp-admin/admin-ajax.php', [
                            'action' => 'doo_player_ajax',
                            'post' => $postId,
                            'nume' => '1',
                            'type' => 'movie'
                        ]);

                        if ($ajaxRes->successful()) {
                            $ajaxData = json_decode($ajaxRes->body(), true);
                            $embedUrl = $ajaxData['embed_url'] ?? '';
                            if ($embedUrl) {
                                if (strpos($embedUrl, '//') === 0) {
                                    $embedUrl = 'https:' . $embedUrl;
                                }

                                $dramaId = (string)Str::uuid();
                                $drama = Drama::create([
                                    'id' => $dramaId,
                                    'title' => $title,
                                    'titleKhmer' => '',
                                    'description' => $description,
                                    'poster' => $movie['poster'] ?? 'https://picsum.photos/300/450',
                                    'genre' => $category,
                                    'trending' => true,
                                    'status' => 'Completed',
                                    'totalEpisodes' => 1,
                                    'source' => $url,
                                    'year' => $movie['year'] ?? '2025',
                                    'rating' => $movie['rating'] ?? '8.5',
                                    'views' => 0
                                ]);

                                $drama->episodes()->create([
                                    'id' => (string)Str::uuid(),
                                    'episode' => 1,
                                    'title' => 'Full Movie',
                                    'videoUrl' => $embedUrl
                                ]);

                                $importedCount++;
                            }
                        }
                    } else if (strpos($url, '/tvshows/') !== false) {
                        // TV Show / Series (Multiple Episodes)
                        $parts = explode('<div class="video-card">', $html);
                        $parsedEpisodes = [];
                        for ($i = 1; $i < count($parts); $i++) {
                            $content = $parts[$i];
                            preg_match('/href=["\'](https?:\/\/khdiamond\.net\/episodes\/[^"\']+)["\']/i', $content, $hrefMatch);
                            $epUrl = $hrefMatch[1] ?? '';
                            
                            preg_match('/class=["\']title["\']>\s*([\s\S]*?)\s*<\/div>/i', $content, $titleMatch);
                            $epTitle = !empty($titleMatch[1]) ? trim(strip_tags($titleMatch[1])) : '';
                            
                            preg_match('/S(\d+)\s*-\s*E(\d+)/i', $content, $metaMatch);
                            $epNum = !empty($metaMatch[2]) ? intval($metaMatch[2]) : count($parsedEpisodes) + 1;
                            
                            if ($epUrl) {
                                $parsedEpisodes[] = [
                                    'url' => $epUrl,
                                    'title' => html_entity_decode($epTitle ?: 'Episode ' . $epNum, ENT_QUOTES, 'UTF-8'),
                                    'episode' => $epNum
                                ];
                            }
                        }

                        if (!empty($parsedEpisodes)) {
                            // Reverse episodes array if they were listed in descending order (newest to oldest)
                            // DooPlay TV Shows usually list episodes chronologically, but let's verify if first is Episode 1
                            if (count($parsedEpisodes) > 1 && $parsedEpisodes[0]['episode'] > $parsedEpisodes[count($parsedEpisodes) - 1]['episode']) {
                                $parsedEpisodes = array_reverse($parsedEpisodes);
                            }

                            $dramaId = (string)Str::uuid();
                            $drama = Drama::create([
                                'id' => $dramaId,
                                'title' => $title,
                                'titleKhmer' => '',
                                'description' => $description,
                                'poster' => $movie['poster'] ?? 'https://picsum.photos/300/450',
                                'genre' => $category,
                                'trending' => true,
                                'status' => 'Ongoing',
                                'totalEpisodes' => count($parsedEpisodes),
                                'source' => $url,
                                'year' => $movie['year'] ?? '2025',
                                'rating' => $movie['rating'] ?? '8.5',
                                'views' => 0
                            ]);

                            foreach ($parsedEpisodes as $ep) {
                                // Fetch the individual episode watch page to get player embed
                                $epResponse = Http::withHeaders([
                                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                                ])->timeout(20)->get($ep['url']);

                                $epEmbedUrl = '';

                                if ($epResponse->successful()) {
                                    $epHtml = $epResponse->body();
                                    preg_match('/data-post=["\'](\d+)["\']/i', $epHtml, $epPostIdMatch);
                                    if (empty($epPostIdMatch)) {
                                        preg_match('/postid-(\d+)/i', $epHtml, $epPostIdMatch);
                                    }
                                    $epPostId = $epPostIdMatch[1] ?? '';

                                    if ($epPostId) {
                                        $epAjaxRes = Http::asForm()->withHeaders([
                                            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                                            'Referer' => 'https://khdiamond.net/',
                                            'Origin' => 'https://khdiamond.net'
                                        ])->timeout(20)->post('https://khdiamond.net/wp-admin/admin-ajax.php', [
                                            'action' => 'doo_player_ajax',
                                            'post' => $epPostId,
                                            'nume' => '1',
                                            'type' => 'tv'
                                        ]);

                                        if ($epAjaxRes->successful()) {
                                            $epAjaxData = json_decode($epAjaxRes->body(), true);
                                            $epEmbedUrl = $epAjaxData['embed_url'] ?? '';
                                            if ($epEmbedUrl && strpos($epEmbedUrl, '//') === 0) {
                                                $epEmbedUrl = 'https:' . $epEmbedUrl;
                                            }
                                        }
                                    }
                                }

                                $drama->episodes()->create([
                                    'id' => (string)Str::uuid(),
                                    'episode' => $ep['episode'],
                                    'title' => $ep['title'],
                                    'videoUrl' => $epEmbedUrl ?: ''
                                ]);
                            }

                            $importedCount++;
                        }
                    }
                } else {
                    // Fallback to old freemovies2u watch page scraping logic
                    $watchUrl = rtrim($url, '/') . '/watch.html';
                    $watchResponse = Http::withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    ])->timeout(15)->get($watchUrl);

                    if ($watchResponse->successful()) {
                        $watchHtml = $watchResponse->body();
                        $videoUrl = '';

                        if (preg_match('/<source\s+[^>]*src=["\']([^"\']+)["\']/i', $watchHtml, $srcMatch)) {
                            $videoUrl = $srcMatch[1];
                        } else if (preg_match('/player\.src\(\{\s*src:\s*[\'"]([^\'"]+)[\'"]/i', $watchHtml, $srcMatch)) {
                            $videoUrl = $srcMatch[1];
                        }

                        if ($videoUrl) {
                            $dramaId = (string)Str::uuid();
                            $drama = Drama::create([
                                'id' => $dramaId,
                                'title' => $title,
                                'titleKhmer' => '',
                                'description' => 'Watch ' . $title . ' online free.',
                                'poster' => $movie['poster'] ?? 'https://picsum.photos/300/450',
                                'genre' => $category,
                                'trending' => true,
                                'status' => 'Completed',
                                'totalEpisodes' => 1,
                                'source' => $url,
                                'year' => $movie['year'] ?? '2025',
                                'rating' => $movie['rating'] ?? '8.5',
                                'views' => 0
                            ]);

                            $drama->episodes()->create([
                                'id' => (string)Str::uuid(),
                                'episode' => 1,
                                'title' => 'Full Movie',
                                'videoUrl' => $videoUrl
                            ]);

                            $importedCount++;
                        }
                    }
                }
            } catch (\Exception $ex) {
                // Log/ignore errors on single items to allow bulk import to continue
                continue;
            }
        }

        return response()->json([
            'success' => true,
            'importedCount' => $importedCount
        ], 201);
    }

    // ── TMDB: scrape a single /movie/{id} or /tv/{id} page ──────────
    private function scrapeTmdb($url, $type, $tmdbId)
    {
        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ])->timeout(15)->get($url);

        if (!$response->successful()) {
            return response()->json(['detail' => 'Failed to fetch TMDB page (HTTP ' . $response->status() . ')'], 400);
        }

        $html = $response->body();

        // Title
        preg_match('/<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']*)["\']/', $html, $tMatch);
        $title = !empty($tMatch[1]) ? html_entity_decode(trim($tMatch[1])) : 'TMDB Import';
        $title = preg_replace('/\s*[-—]\s*The Movie Database.*$/i', '', $title);

        // Check duplicate
        $existing = Drama::where('title', $title)->first();
        if ($existing) {
            return response()->json([
                'id' => $existing->id,
                'title' => $existing->title,
                'episodeCount' => $existing->episodes()->count(),
                'status' => 'already_exists'
            ], 200);
        }

        // Poster
        preg_match('/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']*)["\']/', $html, $pMatch);
        $poster = !empty($pMatch[1]) ? $pMatch[1] : 'https://picsum.photos/300/450';

        // Description
        preg_match('/<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']*)["\']/', $html, $dMatch);
        $description = !empty($dMatch[1]) ? html_entity_decode($dMatch[1]) : '';

        // Year – look for release_date in JSON-LD or page text
        preg_match('/release_date["\']?\s*[:=]\s*["\']?(\d{4})/', $html, $yMatch);
        if (empty($yMatch[1])) {
            preg_match('/(\d{2}\/\d{2}\/(\d{4}))/', $html, $yMatch2);
            $year = !empty($yMatch2[2]) ? $yMatch2[2] : '2025';
        } else {
            $year = $yMatch[1];
        }

        $dramaId = (string) Str::uuid();
        $drama = Drama::create([
            'id' => $dramaId,
            'title' => $title,
            'titleKhmer' => '',
            'description' => $description,
            'poster' => $poster,
            'genre' => '',
            'trending' => true,
            'status' => '',
            'totalEpisodes' => 1,
            'source' => 'tmdb',
            'year' => $year,
            'rating' => '0',
            'views' => 0
        ]);

        $epTitle = $type === 'movie' ? 'Full Movie' : 'Episode 1';
        $drama->episodes()->create([
            'id' => 'ep_' . (string) Str::uuid(),
            'episode' => 1,
            'title' => $epTitle,
            'videoUrl' => ''
        ]);

        return response()->json([
            'id' => $drama->id,
            'title' => $drama->title,
            'episodeCount' => 1,
            'status' => 'imported'
        ], 201);
    }

    // ── TMDB: bulk scrape a list / discover page ────────────────────
    private function scrapeTmdbList($url)
    {
        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ])->timeout(20)->get($url);

        if (!$response->successful()) {
            return response()->json(['detail' => 'Failed to fetch TMDB list page (HTTP ' . $response->status() . ')'], 400);
        }

        $html = $response->body();

        // Find all individual movie/tv links on the page
        preg_match_all('#href=["\'](/(?:movie|tv)/(\d+)[^"\']*)["\']#', $html, $matches, PREG_SET_ORDER);

        if (empty($matches)) {
            return response()->json(['detail' => 'No movie or TV links found on this TMDB page.'], 400);
        }

        // De-duplicate by TMDB ID
        $seen = [];
        $uniqueMatches = [];
        foreach ($matches as $m) {
            $id = $m[2];
            if (!isset($seen[$id])) {
                $seen[$id] = true;
                $uniqueMatches[] = $m;
            }
        }

        $imported = [];
        $limit = 20;
        $count = 0;

        foreach ($uniqueMatches as $m) {
            if ($count >= $limit) break;

            $itemPath = $m[1]; // e.g. /movie/12345-slug
            $itemUrl = 'https://www.themoviedb.org' . $itemPath;
            $type = strpos($itemPath, '/movie/') === 0 ? 'movie' : 'tv';
            $tmdbId = $m[2];

            try {
                $subResp = Http::withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                ])->timeout(15)->get($itemUrl);

                if (!$subResp->successful()) continue;

                $subHtml = $subResp->body();

                // Extract year
                preg_match('/release_date["\']?\s*[:=]\s*["\']?(\d{4})/', $subHtml, $yMatch);
                if (empty($yMatch[1])) {
                    preg_match('/(\d{2}\/\d{2}\/(\d{4}))/', $subHtml, $yMatch2);
                    $year = !empty($yMatch2[2]) ? $yMatch2[2] : null;
                } else {
                    $year = $yMatch[1];
                }

                // Filter: only 2025+
                if (!$year || intval($year) < 2025) continue;

                // Title
                preg_match('/<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']*)["\']/', $subHtml, $tMatch);
                $title = !empty($tMatch[1]) ? html_entity_decode(trim($tMatch[1])) : 'TMDB Import #' . $tmdbId;
                $title = preg_replace('/\s*[-—]\s*The Movie Database.*$/i', '', $title);

                // Skip duplicate
                if (Drama::where('title', $title)->exists()) continue;

                // Poster
                preg_match('/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']*)["\']/', $subHtml, $pMatch);
                $poster = !empty($pMatch[1]) ? $pMatch[1] : 'https://picsum.photos/300/450';

                // Description
                preg_match('/<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"\']*)["\']/', $subHtml, $dMatch);
                $description = !empty($dMatch[1]) ? html_entity_decode($dMatch[1]) : '';

                $dramaId = (string) Str::uuid();
                $drama = Drama::create([
                    'id' => $dramaId,
                    'title' => $title,
                    'titleKhmer' => '',
                    'description' => $description,
                    'poster' => $poster,
                    'genre' => '',
                    'trending' => true,
                    'status' => '',
                    'totalEpisodes' => 1,
                    'source' => 'tmdb',
                    'year' => $year,
                    'rating' => '0',
                    'views' => 0
                ]);

                $epTitle = $type === 'movie' ? 'Full Movie' : 'Episode 1';
                $drama->episodes()->create([
                    'id' => 'ep_' . (string) Str::uuid(),
                    'episode' => 1,
                    'title' => $epTitle,
                    'videoUrl' => ''
                ]);

                $imported[] = [
                    'id' => $drama->id,
                    'title' => $drama->title,
                    'episodeCount' => 1,
                    'status' => 'imported'
                ];
                $count++;
            } catch (\Exception $ex) {
                continue;
            }
        }

        if (empty($imported)) {
            return response()->json(['detail' => 'No TMDB items matching year >= 2025 found on this page.'], 400);
        }

        return response()->json([
            'isBulk' => true,
            'imported' => $imported,
            'importedCount' => count($imported)
        ], 201);
    }
}
