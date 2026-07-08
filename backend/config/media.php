<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Media disk
    |--------------------------------------------------------------------------
    |
    | Disk used to store user-uploaded media (e.g. employee photos). In
    | production this should be the private Cloudflare R2 bucket ("r2"),
    | served through short-lived signed URLs. Locally we default to the
    | "public" disk so photos are viewable via `php artisan storage:link`.
    |
    */

    'disk' => env('MEDIA_DISK', 'public'),

    /*
    | TTL (minutes) for temporary signed URLs of private media on S3.
    */

    'signed_url_ttl' => (int) env('MEDIA_SIGNED_URL_TTL', 10),

    /*
    | Max upload size (kilobytes) accepted for photo uploads.
    */

    'photo_max_kb' => (int) env('MEDIA_PHOTO_MAX_KB', 4096),

];
