<?php

namespace Scriblo\Services;

/**
 * Class RedisCacheService
 * Handles high-throughput in-memory caching, atomic engagement counters,
 * sorted sets for trending articles, and tag-based invalidation.
 */
class RedisCacheService
{
    private ?\Redis $redis = null;
    private bool $isConnected = false;

    public function __construct(string $host = '127.0.0.1', int $port = 6379, ?string $password = null)
    {
        if (class_exists('\Redis')) {
            try {
                $this->redis = new \Redis();
                $this->isConnected = @$this->redis->connect($host, $port, 2.0);
                if ($this->isConnected && $password) {
                    $this->redis->auth($password);
                }
            } catch (\Throwable $e) {
                $this->isConnected = false;
                error_log("Redis connection error: " . $e->getMessage());
            }
        }
    }

    public function isAvailable(): bool
    {
        return $this->isConnected && $this->redis !== null;
    }

    /**
     * Get cached item or execute fallback callable (Cache-Aside pattern)
     */
    public function remember(string $key, int $ttlSeconds, callable $fallback): mixed
    {
        if (!$this->isAvailable()) {
            return $fallback();
        }

        $cached = $this->redis->get($key);
        if ($cached !== false) {
            return json_decode($cached, true);
        }

        $data = $fallback();
        if ($data !== null) {
            $this->redis->setex($key, $ttlSeconds, json_encode($data));
        }

        return $data;
    }

    /**
     * Atomically increment engagement metric (views, likes, claps) in Redis buffer
     */
    public function incrementEngagement(int $articleId, string $metric = 'views', int $amount = 1): int
    {
        if (!$this->isAvailable()) {
            return 0;
        }

        $hashKey = "stats:article:{$articleId}";
        return (int)$this->redis->hIncrBy($hashKey, $metric, $amount);
    }

    /**
     * Fetch buffered metrics for an article from Redis
     */
    public function getBufferedMetrics(int $articleId): array
    {
        if (!$this->isAvailable()) {
            return [];
        }

        $hashKey = "stats:article:{$articleId}";
        return $this->redis->hGetAll($hashKey) ?: [];
    }

    /**
     * Update article score in Redis Sorted Set for real-time trending leaderboards
     */
    public function updateRankingScore(int $articleId, float $score, string $feedKey = 'ranking:global:trending'): void
    {
        if ($this->isAvailable()) {
            $this->redis->zAdd($feedKey, $score, (string)$articleId);
        }
    }

    /**
     * Get top ranked article IDs from Redis Sorted Set
     */
    public function getTopRankedArticleIds(int $limit = 20, int $offset = 0, string $feedKey = 'ranking:global:trending'): array
    {
        if (!$this->isAvailable()) {
            return [];
        }

        // ZREVRANGE to return highest scores first
        return $this->redis->zRevRange($feedKey, $offset, $offset + $limit - 1) ?: [];
    }

    /**
     * Store temporary passwordless magic auth token
     */
    public function storeMagicToken(string $tokenHash, array $userData, int $ttlSeconds = 900): bool
    {
        if (!$this->isAvailable()) {
            return false;
        }

        return $this->redis->setex("auth:magic:{$tokenHash}", $ttlSeconds, json_encode($userData));
    }

    /**
     * Verify and immediately consume (burn) single-use magic token
     */
    public function consumeMagicToken(string $tokenHash): ?array
    {
        if (!$this->isAvailable()) {
            return null;
        }

        $key = "auth:magic:{$tokenHash}";
        $data = $this->redis->get($key);
        if ($data !== false) {
            $this->redis->del($key); // Single-use consumption
            return json_decode($data, true);
        }

        return null;
    }

    /**
     * Invalidate cached article and related feed caches
     */
    public function invalidateArticle(int $articleId, ?int $categoryId = null): void
    {
        if (!$this->isAvailable()) {
            return;
        }

        $this->redis->del("article:id:{$articleId}");
        if ($categoryId) {
            $this->redis->del("feed:category:{$categoryId}");
        }
        $this->redis->del("feed:home:recent");
    }
}
