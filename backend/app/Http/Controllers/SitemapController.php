<?php

namespace App\Http\Controllers;

use App\Models\Drama;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate dynamic XML sitemap.
     *
     * @return \Illuminate\Http\Response
     */
    public function generate(): Response
    {
        // Get all dramas ordered by updated_at desc to find latest modification
        $dramas = Drama::select('id', 'updated_at')->orderBy('updated_at', 'desc')->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // 1. Home page
        $homeLastmod = $dramas->first() ? $dramas->first()->updated_at->toAtomString() : now()->toAtomString();
        $xml .= "  <url>\n";
        $xml .= "    <loc>https://movie.mekongcyberunit.app/</loc>\n";
        $xml .= "    <lastmod>" . $homeLastmod . "</lastmod>\n";
        $xml .= "    <changefreq>daily</changefreq>\n";
        $xml .= "    <priority>1.0</priority>\n";
        $xml .= "  </url>\n";

        // 2. Individual watch pages
        foreach ($dramas as $drama) {
            $lastmod = $drama->updated_at ? $drama->updated_at->toAtomString() : now()->toAtomString();
            $xml .= "  <url>\n";
            $xml .= "    <loc>https://movie.mekongcyberunit.app/#/watch/" . htmlspecialchars($drama->id) . "</loc>\n";
            $xml .= "    <lastmod>" . $lastmod . "</lastmod>\n";
            $xml .= "    <changefreq>weekly</changefreq>\n";
            $xml .= "    <priority>0.8</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
