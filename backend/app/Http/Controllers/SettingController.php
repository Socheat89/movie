<?php

namespace App\Http\Controllers;

use App\Models\Setting;

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
}
