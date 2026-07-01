<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Drama extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'title',
        'titleKhmer',
        'description',
        'poster',
        'genre',
        'trending',
        'status',
        'totalEpisodes',
        'source',
        'year',
        'rating',
        'views'
    ];

    protected $casts = [
        'trending' => 'boolean',
        'totalEpisodes' => 'integer',
        'views' => 'integer'
    ];

    public function episodes()
    {
        return $this->hasMany(Episode::class, 'drama_id', 'id')->orderBy('episode', 'asc');
    }
}
