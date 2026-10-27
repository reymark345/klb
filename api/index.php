<?php

/**
 * Vercel Serverless Entrypoint for Laravel 11 + Inertia React
 * Ensures writable /tmp storage directories on Vercel's read-only filesystem.
 */
if (isset($_ENV['VERCEL']) || isset($_SERVER['VERCEL']) || getenv('VERCEL')) {
    $storagePath = '/tmp/storage';
    $dirs = [
        $storagePath . '/app/public',
        $storagePath . '/framework/cache/data',
        $storagePath . '/framework/sessions',
        $storagePath . '/framework/testing',
        $storagePath . '/framework/views',
        $storagePath . '/logs',
    ];

    foreach ($dirs as $dir) {
        if (! is_dir($dir)) {
            @mkdir($dir, 0777, true);
        }
    }
}

require __DIR__ . '/../public/index.php';

