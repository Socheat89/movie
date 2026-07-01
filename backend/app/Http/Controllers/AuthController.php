<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    private const DEFAULT_HASH = "YWRtaW4xMjM="; // base64('admin123')

    public function login(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $pwd = $request->input('password');
        $storedSetting = Setting::find('adminHash');
        $storedHash = $storedSetting ? json_decode($storedSetting->value) : self::DEFAULT_HASH;

        if (base64_encode($pwd) === $storedHash) {
            return response()->json(['ok' => true]);
        }

        return response()->json(['detail' => 'Incorrect password'], 401);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required|string',
            'new_password' => 'required|string',
        ]);

        $oldPwd = $request->input('old_password');
        $newPwd = $request->input('new_password');

        $storedSetting = Setting::find('adminHash');
        $storedHash = $storedSetting ? json_decode($storedSetting->value) : self::DEFAULT_HASH;

        if (base64_encode($oldPwd) !== $storedHash) {
            return response()->json(['detail' => 'Incorrect current password'], 401);
        }

        $newHash = base64_encode($newPwd);
        Setting::updateOrCreate(
            ['key' => 'adminHash'],
            ['value' => json_encode($newHash)]
        );

        return response()->json(['ok' => true]);
    }
}
