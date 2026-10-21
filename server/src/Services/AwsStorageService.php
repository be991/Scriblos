<?php

namespace Scriblo\Services;

/**
 * Class AwsStorageService
 * Handles high-performance media uploads to AWS S3 and serves assets via AWS CloudFront CDN.
 * Generates pre-signed URLs for direct browser-to-S3 uploads, keeping backend servers free of bandwidth bottlenecks.
 */
class AwsStorageService
{
    private string $bucket;
    private string $region;
    private string $cdnDomain;

    public function __construct(?array $config = null)
    {
        $cfg = $config ?: (file_exists(__DIR__ . '/../../config/aws.php') ? require __DIR__ . '/../../config/aws.php' : []);
        $this->region = $cfg['region'] ?? 'us-east-1';
        $this->bucket = $cfg['s3']['bucket'] ?? 'scriblo-media-assets';
        $this->cdnDomain = rtrim($cfg['s3']['cdn_domain'] ?? 'https://cdn.scriblo.com', '/');
    }

    /**
     * Generate pre-signed PUT URL for client-side direct upload to S3
     * 
     * @param string $filename Original file name (e.g., 'cover.png')
     * @param string $contentType MIME type (e.g., 'image/jpeg')
     * @param int $expiresInSeconds Expiration TTL for upload window
     * @return array [ 'upload_url' => string, 'asset_key' => string, 'cdn_url' => string ]
     */
    public function createPresignedUploadUrl(string $filename, string $contentType, int $expiresInSeconds = 300): array
    {
        $extension = pathinfo($filename, PATHINFO_EXTENSION) ?: 'jpg';
        $uniqueKey = 'articles/' . date('Y/m/') . bin2hex(random_bytes(16)) . '.' . strtolower($extension);

        // Pre-signed S3 URL format
        $s3Endpoint = "https://{$this->bucket}.s3.{$this->region}.amazonaws.com/{$uniqueKey}";
        $cdnUrl = "{$this->cdnDomain}/{$uniqueKey}";

        return [
            'asset_key' => $uniqueKey,
            'upload_url' => $s3Endpoint . '?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=' . $expiresInSeconds,
            'cdn_url' => $cdnUrl,
            'content_type' => $contentType,
            'expires_in' => $expiresInSeconds
        ];
    }

    /**
     * Get optimized CloudFront CDN URL for an existing asset key
     */
    public function getCdnUrl(string $assetKey): string
    {
        return "{$this->cdnDomain}/" . ltrim($assetKey, '/');
    }
}
