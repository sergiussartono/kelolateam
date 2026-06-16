<?php

return [
    'path' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['Content-Type', 'Content-Disposition'],    'max_age' => 0,
    'supports_credentials' => true,
    
];