<?php

namespace App\Http\Controllers;

use App\Models\Drama;
use App\Models\Episode;
use Illuminate\Http\Request;
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
                'episodeCount' => $drama->episodes_count,
                'createdAt' => strtotime($drama->created_at),
            ];
        });

        return response()->json($dramas->sortByDesc('createdAt')->values()->all());
    }

    public function show($id)
    {
        $drama = Drama::with('episodes')->find($id);
        if (!$drama) {
            return response()->json(['detail' => 'Drama not found'], 404);
        }
        return response()->json([
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
        ]);
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
            'source' => $data['source'] ?? ''
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
