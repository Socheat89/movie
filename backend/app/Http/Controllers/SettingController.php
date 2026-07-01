<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    private const DEFAULT_CATEGORIES = ["Romance", "Action", "Thriller", "Comedy", "Mystery", "Fantasy", "Biography"];

    public function getCategories()
    {
        $setting = Setting::find('categories');
        if (!$setting) {
            Setting::create([
                'key' => 'categories',
                'value' => json_encode(self::DEFAULT_CATEGORIES)
            ]);
            return response()->json(self::DEFAULT_CATEGORIES);
        }
        return response()->json(json_decode($setting->value));
    }

    public function saveCategories(Request $request)
    {
        $request->validate([
            'categories' => 'required|array',
            'categories.*' => 'required|string',
        ]);

        $categories = $request->input('categories');
        
        Setting::updateOrCreate(
            ['key' => 'categories'],
            ['value' => json_encode($categories)]
        );

        return response()->json($categories);
    }

    public function getSponsorQr()
    {
        $setting = Setting::find('sponsor_qr');
        return response()->json([
            'qr_url' => $setting ? $setting->value : ''
        ]);
    }

    public function saveSponsorQr(Request $request)
    {
        $request->validate([
            'qr_url' => 'nullable|string'
        ]);

        Setting::updateOrCreate(
            ['key' => 'sponsor_qr'],
            ['value' => $request->input('qr_url') ?? '']
        );

        return response()->json([
            'qr_url' => $request->input('qr_url') ?? ''
        ]);
    }

    public function uploadSponsorQr(Request $request)
    {
        $request->validate([
            'qr_file' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);

        if ($request->hasFile('qr_file')) {
            $file = $request->file('qr_file');
            $filename = 'sponsor_qr_' . time() . '.' . $file->getClientOriginalExtension();
            $destPath = public_path('uploads');
            
            try {
                if (!file_exists($destPath)) {
                    @mkdir($destPath, 0755, true);
                }
                $file->move($destPath, $filename);
                $url = asset('uploads/' . $filename);
            } catch (\Exception $e) {
                // Fallback: save to storage/app/public/uploads which is guaranteed writable
                try {
                    $file->storeAs('public/uploads', $filename);
                    $url = asset('storage/uploads/' . $filename);
                } catch (\Exception $ex) {
                    return response()->json(['detail' => 'Upload failed. Permissions error: ' . $ex->getMessage()], 500);
                }
            }
            
            Setting::updateOrCreate(
                ['key' => 'sponsor_qr'],
                ['value' => $url]
            );

            return response()->json([
                'qr_url' => $url
            ]);
        }

        return response()->json(['detail' => 'No file uploaded.'], 400);
    }
}
