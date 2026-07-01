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
}
