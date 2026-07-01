<?php

namespace App\Http\Controllers;

use App\Models\Drama;
use App\Models\Episode;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EpisodeController extends Controller
{
    public function index($drama_id)
    {
        $drama = Drama::find($drama_id);
        if (!$drama) {
            return response()->json(['detail' => 'Drama not found'], 404);
        }
        return response()->json($drama->episodes->map(function($ep) {
            return [
                'id' => $ep->id,
                'drama_id' => $ep->drama_id,
                'episode' => $ep->episode,
                'title' => $ep->title,
                'videoUrl' => $ep->videoUrl,
                'createdAt' => strtotime($ep->created_at),
            ];
        }));
    }

    public function store(Request $request, $drama_id)
    {
        $drama = Drama::find($drama_id);
        if (!$drama) {
            return response()->json(['detail' => 'Drama not found'], 404);
        }

        $data = $request->validate([
            'id' => 'nullable|string',
            'episode' => 'nullable|integer',
            'title' => 'required|string',
            'videoUrl' => 'nullable|string',
        ]);

        $epId = $data['id'] ?? ('ep_' . substr((string)Str::uuid(), 0, 8));
        $epNum = $data['episode'] ?? ($drama->episodes()->count() + 1);

        $ep = $drama->episodes()->create([
            'id' => $epId,
            'episode' => $epNum,
            'title' => $data['title'],
            'videoUrl' => $data['videoUrl'] ?? '',
        ]);

        return response()->json([
            'id' => $ep->id,
            'drama_id' => $ep->drama_id,
            'episode' => $ep->episode,
            'title' => $ep->title,
            'videoUrl' => $ep->videoUrl,
            'createdAt' => strtotime($ep->created_at),
        ], 201);
    }

    public function update(Request $request, $drama_id, $id)
    {
        $drama = Drama::find($drama_id);
        if (!$drama) {
            return response()->json(['detail' => 'Drama not found'], 404);
        }

        $ep = $drama->episodes()->where('id', $id)->first();
        if (!$ep) {
            return response()->json(['detail' => 'Episode not found'], 404);
        }

        $data = $request->validate([
            'title' => 'sometimes|string',
            'videoUrl' => 'sometimes|nullable|string',
            'episode' => 'sometimes|integer',
        ]);

        $ep->update($data);

        return response()->json([
            'id' => $ep->id,
            'drama_id' => $ep->drama_id,
            'episode' => $ep->episode,
            'title' => $ep->title,
            'videoUrl' => $ep->videoUrl,
            'createdAt' => strtotime($ep->created_at),
        ]);
    }

    public function destroy($drama_id, $id)
    {
        $drama = Drama::find($drama_id);
        if (!$drama) {
            return response()->json(['detail' => 'Drama not found'], 404);
        }

        $ep = $drama->episodes()->where('id', $id)->first();
        if (!$ep) {
            return response()->json(['detail' => 'Episode not found'], 404);
        }

        $ep->delete();
        return response()->json(['deleted' => true]);
    }
}
