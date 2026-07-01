<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\SitemapController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/sitemap.xml', [SitemapController::class, 'generate']);

Route::get('/init-app', function () {
    try {
        Artisan::call('key:generate');
        Artisan::call('migrate');
        Artisan::call('storage:link');
        return "App Initialized & Migrations Run successfully! Key: " . Artisan::output();
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});
