<?php

return [
    'host' => getenv('REDIS_HOST') ?: '127.0.0.1',
    'port' => (int)(getenv('REDIS_PORT') ?: 6379),
    'password' => getenv('REDIS_PASSWORD') ?: null,
    'timeout' => 2.5,
    'default_ttl' => 3600, // 1 hour default
    'prefix' => 'scriblo:'
];
