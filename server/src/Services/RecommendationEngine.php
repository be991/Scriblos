<?php

namespace Scriblo\Services;

/**
 * Class RecommendationEngine
 * Builds a personalized article feed matching user interest vectors,
 * reading history completion rates, and author affinity against article taxonomy.
 */
class RecommendationEngine
{
    private DualFactorRanker $ranker;
    private RedisCacheService $cache;

    public function __construct(DualFactorRanker $ranker, RedisCacheService $cache)
    {
        $this->ranker = $ranker;
        $this->cache = $cache;
    }

    /**
     * Compute recommendation match score between user profile and candidate article
     *
     * @param array $userInterests Key-value map of category_id => affinity (1.0 - 5.0)
     * @param array $article Candidate article
     * @param array $userHistoryIds IDs of articles already read by user
     * @return array [ 'match_score' => float, 'match_reason' => string ]
     */
    public function computeMatch(array $userInterests, array $article, array $userHistoryIds = []): array
    {
        $articleId = (int)$article['id'];
        $categoryId = (int)$article['category_id'];

        // Penalize recently read articles slightly to encourage content discovery
        $historyPenalty = in_array($articleId, $userHistoryIds) ? 0.35 : 1.0;

        // Interest Affinity Match
        $affinity = $userInterests[$categoryId] ?? 0.8; // Default baseline for unexplored categories
        $normalizedAffinity = min(1.0, $affinity / 5.0);

        // Quality & Engagement Signal from Metrics
        $avgReadRatio = (float)($article['avg_read_ratio'] ?? 0.5);
        $qualityBonus = 1.0 + ($avgReadRatio * 0.4);

        // Calculate combined recommendation affinity score
        $matchScore = round(($normalizedAffinity * 0.6 + $qualityBonus * 0.4) * $historyPenalty, 3);

        // Determine human-readable match reason
        $reason = "Trending in " . ($article['category_name'] ?? 'your community');
        if (isset($userInterests[$categoryId]) && $userInterests[$categoryId] >= 4.0) {
            $reason = "Top pick based on your interest in " . ($article['category_name'] ?? 'this topic');
        } elseif ($avgReadRatio >= 0.85) {
            $reason = "High completion rate (90%+ readers finished this story)";
        }

        return [
            'match_score' => $matchScore,
            'match_percentage' => (int)min(100, max(15, $matchScore * 100)),
            'match_reason' => $reason
        ];
    }

    /**
     * Generate personalized feed for a given user
     */
    public function getPersonalizedFeed(int $userId, array $candidateArticles, array $userInterests, array $historyIds = []): array
    {
        $scoredArticles = [];

        foreach ($candidateArticles as $article) {
            $matchData = $this->computeMatch($userInterests, $article, $historyIds);
            
            // Re-rank using Dual-Factor Ranker with personalized category multiplier
            $pubTime = isset($article['published_at']) ? strtotime($article['published_at']) : time();
            $dualFactor = $this->ranker->calculateScore($article, $pubTime, $matchData['match_score']);

            $article['recommendation'] = $matchData;
            $article['personalized_score'] = round($dualFactor['total_score'] * $matchData['match_score'], 4);
            $scoredArticles[] = $article;
        }

        // Sort by personalized score descending
        usort($scoredArticles, function ($a, $b) {
            return ($b['personalized_score'] <=> $a['personalized_score']);
        });

        return $scoredArticles;
    }
}
