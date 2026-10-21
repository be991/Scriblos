<?php

return [
    'region' => getenv('AWS_DEFAULT_REGION') ?: 'us-east-1',
    's3' => [
        'bucket' => getenv('AWS_S3_BUCKET') ?: 'scriblo-media-assets',
        'cdn_domain' => getenv('AWS_CLOUDFRONT_DOMAIN') ?: 'https://cdn.scriblo.com',
    ],
    'ses' => [
        'from_email' => getenv('AWS_SES_FROM_EMAIL') ?: 'noreply@scriblo.com',
        'from_name' => 'Scriblo Publishing'
    ]
];
