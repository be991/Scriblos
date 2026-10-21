<?php

// Autoload services
require_once __DIR__ . '/../src/Services/RedisCacheService.php';
require_once __DIR__ . '/../src/Services/DualFactorRanker.php';
require_once __DIR__ . '/../src/Services/RecommendationEngine.php';
require_once __DIR__ . '/../src/Services/EmailAuthService.php';

use Scriblo\Services\RedisCacheService;
use Scriblo\Services\DualFactorRanker;
use Scriblo\Services\RecommendationEngine;
use Scriblo\Services\EmailAuthService;

// Setup CORS & JSON Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load Configs
$dbConfig = require __DIR__ . '/../config/database.php';
$redisConfig = require __DIR__ . '/../config/redis.php';

// Instantiate Core Services
$cacheService = new RedisCacheService($redisConfig['host'], $redisConfig['port'], $redisConfig['password']);
$ranker = new DualFactorRanker();
$recommender = new RecommendationEngine($ranker, $cacheService);
$authService = new EmailAuthService($cacheService);

// Helper for sending structured JSON responses
function sendResponse(mixed $data, int $status = 200, array $meta = []): void {
    http_response_code($status);
    echo json_encode([
        'status' => $status >= 200 && $status < 300 ? 'success' : 'error',
        'timestamp' => time(),
        'meta' => array_merge(['cache_engine' => 'Redis/PHP'], $meta),
        'data' => $data
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit();
}

// Simple Router
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Fallback seed articles for local dev when MySQL isn't directly bound
$sampleArticles = [
    [
        'id' => 1,
        'title' => 'Architecture at Scale: Why Multi-Tier Redis Caching Redefined Our P99 Latency',
        'slug' => 'multi-tier-redis-caching-p99-latency',
        'subtitle' => 'How pairing in-memory buffer rings with write-behind persistence eliminated database connection saturation under 50k RPS.',
        'category_id' => 1,
        'category_name' => 'Engineering & Tech',
        'author' => [
            'name' => 'Elena Rostova',
            'handle' => '@elenarostova',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
            'bio' => 'Distributed systems architect & essayist.'
        ],
        'cover_image' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        'read_time_minutes' => 6,
        'published_at' => date('Y-m-d H:i:s', time() - 14400),
        'views_count' => 4280,
        'likes_count' => 312,
        'comments_count' => 48,
        'bookmarks_count' => 185,
        'avg_read_ratio' => 0.88,
        'content' => "When handling high-concurrency editorial platforms, direct database querying is the fastest path to catastrophic cascade failures.\n\nIn our architecture benchmark, raw MySQL connection pooling degraded past 8,000 concurrent reader connections. By introducing an in-memory Redis cluster arranged in read-through cached layers alongside atomic hash counters (`HINCRBY`), we dropped our P99 read latency from 420ms down to 18ms."
    ],
    [
        'id' => 2,
        'title' => 'The Quiet Renaissance of Editorial Typography on the Modern Web',
        'slug' => 'editorial-typography-renaissance',
        'subtitle' => 'Why fluid variable fonts, proportional line scales, and intentional whitespace create timeless reading comfort.',
        'category_id' => 3,
        'category_name' => 'Design & Aesthetics',
        'author' => [
            'name' => 'Marcus Vane',
            'handle' => '@marcusvane',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
            'bio' => 'Typographer and product designer.'
        ],
        'cover_image' => 'https://images.unsplash.com/photo-1505682634684-8078b273b0a8?auto=format&fit=crop&w=1200&q=80',
        'read_time_minutes' => 4,
        'published_at' => date('Y-m-d H:i:s', time() - 43200),
        'views_count' => 2890,
        'likes_count' => 198,
        'comments_count' => 26,
        'bookmarks_count' => 142,
        'avg_read_ratio' => 0.92,
        'content' => "We have spent a decade optimizing websites for glanceability, accidentally sacrificing deep contemplation in the process.\n\nTrue editorial typography is an invisible pact between writer and reader. When the line length exceeds 75 characters, eye tracking becomes fatiguing; when leading drops below 1.6, paragraphs coagulate into dense blocks of unapproachable text."
    ],
    [
        'id' => 3,
        'title' => 'The 1,000 True Readers Doctrine: Sustainable Independence for Contemporary Writers',
        'slug' => '1000-true-readers-doctrine',
        'subtitle' => 'Moving away from algorithmic engagement traps toward direct audience ownership, micro-newsletters, and focused essays.',
        'category_id' => 2,
        'category_name' => 'Writing & Craft',
        'author' => [
            'name' => 'Clara Thorne',
            'handle' => '@clarathorne',
            'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
            'bio' => 'Tech essayist & indie publishing advocate.'
        ],
        'cover_image' => 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
        'read_time_minutes' => 5,
        'published_at' => date('Y-m-d H:i:s', time() - 86400),
        'views_count' => 3650,
        'likes_count' => 265,
        'comments_count' => 39,
        'bookmarks_count' => 210,
        'avg_read_ratio' => 0.85,
        'content' => "Algorithmic feeds reward outrage and volume. True writing rewards depth and nuance.\n\nFor centuries, the printing press empowered syndicates. Now, passwordless magic links and direct email subscriptions empower solitary writers to sustain vibrant intellectual careers without editorial gatekeepers."
    ],
    [
        'id' => 4,
        'title' => 'The Solopreneur Stack: Orchestrating High-Throughput APIs with Zero DevOps Bloat',
        'slug' => 'solopreneur-stack-high-throughput',
        'subtitle' => 'How a lean stack of PHP 8.2, Redis, and MySQL outperforms complex distributed microservices for 99% of digital ventures.',
        'category_id' => 4,
        'category_name' => 'Startup & Leadership',
        'author' => [
            'name' => 'Elena Rostova',
            'handle' => '@elenarostova',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
            'bio' => 'Distributed systems architect & essayist.'
        ],
        'cover_image' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        'read_time_minutes' => 7,
        'published_at' => date('Y-m-d H:i:s', time() - 172800),
        'views_count' => 1920,
        'likes_count' => 134,
        'comments_count' => 18,
        'bookmarks_count' => 92,
        'avg_read_ratio' => 0.79,
        'content' => "Premature microservices are the silent killer of early-stage software projects.\n\nA well-architected monolithic API powered by modern PHP with OPcache, backed by Redis in-memory caches, can comfortably serve millions of daily requests on modest cloud hardware."
    ]
];

// ROUTING LOGIC

// 1. Trending Feed (Dual-Factor Ranking)
if (preg_match('#^/api/feed/trending#', $uri)) {
    $ranked = $ranker->rankCollection($sampleArticles);
    sendResponse($ranked, 200, ['algorithm' => 'Dual-Factor (Engagement Velocity + Taxonomy Decay)']);
}

// 2. Personalized Feed (Recommendation Engine)
if (preg_match('#^/api/feed/personalized#', $uri)) {
    // Sample user interest vector (User heavily favors Tech & Writing)
    $userInterests = [1 => 5.0, 2 => 4.5, 3 => 3.0, 4 => 2.0];
    $personalized = $recommender->getPersonalizedFeed(1, $sampleArticles, $userInterests);
    sendResponse($personalized, 200, ['algorithm' => 'Personalized Interest Matching & Vector Affinity']);
}

// 3. Passwordless Magic Link Request
if ($uri === '/api/auth/magic-link' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';
    try {
        $result = $authService->requestMagicLink($email, $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
        sendResponse($result, 200);
    } catch (\Exception $e) {
        sendResponse(['error' => $e->getMessage()], 400);
    }
}

// 4. Verify Magic Link Token
if ($uri === '/api/auth/verify' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $token = $input['token'] ?? '';
    $session = $authService->verifyMagicToken($token);
    if ($session) {
        sendResponse($session, 200);
    } else {
        sendResponse(['error' => 'Invalid or expired magic link token.'], 401);
    }
}

// 5. Article Engagement (Like/Clap, Bookmark, Read Ratio)
if (preg_match('#^/api/articles/(\d+)/engage#', $uri, $matches) && $method === 'POST') {
    $articleId = (int)$matches[1];
    $input = json_decode(file_get_contents('php://input'), true);
    $type = $input['type'] ?? 'like'; // 'like', 'view', 'bookmark', 'read_complete'

    // Atomic increment in Redis buffer
    $newCount = $cacheService->incrementEngagement($articleId, $type . '_count', 1);

    sendResponse([
        'article_id' => $articleId,
        'action' => $type,
        'new_buffered_count' => $newCount,
        'cache_strategy' => 'Atomic Redis HINCRBY buffer'
    ], 200);
}

// 6. Writer Studio Analytics
if (preg_match('#^/api/analytics#', $uri)) {
    $analytics = [
        'total_reads' => 12740,
        'total_claps' => 909,
        'avg_completion_rate' => 0.86,
        'subscribers_count' => 348,
        'weekly_growth_percent' => 18.4,
        'daily_read_trend' => [
            ['day' => 'Mon', 'views' => 1420, 'completions' => 1210],
            ['day' => 'Tue', 'views' => 1890, 'completions' => 1640],
            ['day' => 'Wed', 'views' => 2100, 'completions' => 1820],
            ['day' => 'Thu', 'views' => 1750, 'completions' => 1510],
            ['day' => 'Fri', 'views' => 2450, 'completions' => 2190],
            ['day' => 'Sat', 'views' => 2800, 'completions' => 2450],
            ['day' => 'Sun', 'views' => 3120, 'completions' => 2750]
        ],
        'top_performing_topics' => [
            ['name' => 'Engineering & Tech', 'share' => 45],
            ['name' => 'Writing & Craft', 'share' => 30],
            ['name' => 'Design & Aesthetics', 'share' => 25]
        ]
    ];
    sendResponse($analytics, 200);
}

// Default Fallback: Articles list
sendResponse($sampleArticles, 200, ['total' => count($sampleArticles)]);
