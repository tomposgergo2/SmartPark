<?php

return [
    // Access token lifetime in minutes
    'access_token_minutes' => env('ACCESS_TOKEN_MINUTES', 60),

    // Refresh token lifetime in days
    'refresh_token_days' => env('REFRESH_TOKEN_DAYS', 30),

    // Length in bytes for generated refresh tokens
    'refresh_token_length' => env('REFRESH_TOKEN_LENGTH', 64),
];
