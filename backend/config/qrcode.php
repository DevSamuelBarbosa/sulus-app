<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Temporary QR token
    |--------------------------------------------------------------------------
    |
    | The QR token an employee shows is opaque and short-lived. It is stored in
    | the cache (Redis) with a TTL and deleted on first successful validation,
    | guaranteeing single use. No personal data ever travels inside the QR.
    |
    */

    // Lifetime of a generated QR token, in seconds.
    'ttl' => (int) env('QRCODE_TTL', 180),

    // Length of the opaque random token.
    'token_length' => (int) env('QRCODE_TOKEN_LENGTH', 40),

    // Cache key prefix for stored tokens.
    'cache_prefix' => env('QRCODE_CACHE_PREFIX', 'qr'),

    /*
    | Short-lived confirmation reference returned by validation and consumed by
    | the usage-registration endpoint, so every registered usage requires a
    | real scan and each scan yields at most one record.
    */
    'confirmation_ttl' => (int) env('QRCODE_CONFIRMATION_TTL', 120),
    'confirmation_prefix' => env('QRCODE_CONFIRMATION_PREFIX', 'qrconfirm'),

];
