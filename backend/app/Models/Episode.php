<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Episode extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'drama_id',
        'episode',
        'title',
        'videoUrl'
    ];

    protected $casts = [
        'episode' => 'integer'
    ];

    public function drama()
    {
        return $this->belongsTo(Drama::class, 'drama_id', 'id');
    }
}
