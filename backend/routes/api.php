<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

use App\Http\Controllers\DramaController;
use App\Http\Controllers\EpisodeController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\AuthController;

Route::get('/dramas', [DramaController::class, 'index']);
Route::get('/dramas/{id}', [DramaController::class, 'show']);
Route::post('/dramas', [DramaController::class, 'store']);
Route::put('/dramas/{id}', [DramaController::class, 'update']);
Route::delete('/dramas/{id}', [DramaController::class, 'destroy']);
Route::post('/dramas/bulk-genre', [DramaController::class, 'bulkUpdateGenre']);

Route::get('/dramas/{drama_id}/episodes', [EpisodeController::class, 'index']);
Route::post('/dramas/{drama_id}/episodes', [EpisodeController::class, 'store']);
Route::put('/dramas/{drama_id}/episodes/{id}', [EpisodeController::class, 'update']);
Route::delete('/dramas/{drama_id}/episodes/{id}', [EpisodeController::class, 'destroy']);

Route::get('/categories', [SettingController::class, 'getCategories']);
Route::post('/categories', [SettingController::class, 'saveCategories']);
Route::get('/settings/sponsor-qr', [SettingController::class, 'getSponsorQr']);
Route::post('/settings/sponsor-qr', [SettingController::class, 'saveSponsorQr']);
Route::post('/settings/sponsor-qr/upload', [SettingController::class, 'uploadSponsorQr']);

Route::post('/admin/login', [AuthController::class, 'login']);
Route::post('/admin/change-password', [AuthController::class, 'changePassword']);
Route::post('/admin/scrape', [DramaController::class, 'scrape']);

