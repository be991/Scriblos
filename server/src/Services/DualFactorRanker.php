<?php

namespace Scriblo\Services;

/**
 * Class DualFactorRanker
 * Calculates article rank using a balanced dual-factor methodology:
 * Factor 1: Multi-signal Engagement Velocity (Views, Claps/Likes, Comments, Bookmarks, Read-Ratio)
 * Factor 2: Taxonomy & Category Relevance
 * Modulated by a smooth time-decay gravity function.
 */
class DualFactorRanker
{
    // Engagement Weights
    private float $weightViews = 0.8;
    private float $weightLikes = 3.5;
    private float $weightComments = 6.0;
    private float $weightBookmarks = 4.0;
    private float $weightReadRatio = 12.0;

    // Time decay parameters
    private float $gravity = 1.4;

    /**
     * Compute comprehensive dual-factor ranking score
     *
     * @param array $metrics Article engagement metrics (views, likes, comments, etc.)
     * @param int $publishedTimestamp Unix timestamp of publication
     * @param float $categoryAffinity Multiplier for category priority (default 1.0)
     * @return array [ 'total_score' => float, 'engagement_factor' => float, 'time_decay' => float, 'breakdown' => array ]
     */
    public function calculateScore(array $metrics, int $publishedTimestamp, float $categoryAffinity = 1.0): array
    {
        $views = max(0, (int)($metrics['views_count'] ?? 0));
        $likes = max(0, (int)($metrics['likes_count'] ?? 0));
        $comments = max(0, (int)($metrics['comments_count'] ?? 0));
        $bookmarks = max(0, (int)($metrics['bookmarks_count'] ?? 0));
        $readRatio = min(1.0, max(0.0, (float)($metrics['avg_read_ratio'] ?? 0.0)));

        // 1. Calculate raw engagement factor with sublinear scaling on views to prevent viral distortion
        $viewsScore = $this->weightViews * log(1 + $views);
        $likesScore = $this->weightLikes * $likes;
        $commentsScore = $this->weightComments * $comments;
        $bookmarksScore = $this->weightBookmarks * $bookmarks;
        $readRatioScore = $this->weightReadRatio * $readRatio * 10; // Scaled for high impact

        $rawEngagement = $viewsScore + $likesScore + $commentsScore + $bookmarksScore + $readRatioScore;

        // 2. Factor in Taxonomy / Category Affinity
        $categoryFactor = max(0.2, $categoryAffinity);
        $factoredEngagement = $rawEngagement * $categoryFactor;

        // 3. Calculate Time Decay (Gravity formula)
        $now = time();
        $ageInHours = max(0.1, ($now - $publishedTimestamp) / 3600.0);
        $decayDivisor = pow($ageInHours + 2.0, $this->gravity);

        // Final balanced rank score
        $finalScore = round($factoredEngagement / $decayDivisor, 4);

        return [
            'total_score' => $finalScore,
            'engagement_factor' => round($factoredEngagement, 3),
            'time_decay_divisor' => round($decayDivisor, 3),
            'age_hours' => round($ageInHours, 1),
            'breakdown' => [
                'views_contribution' => round($viewsScore, 2),
                'likes_contribution' => round($likesScore, 2),
                'comments_contribution' => round($commentsScore, 2),
                'bookmarks_contribution' => round($bookmarksScore, 2),
                'read_ratio_contribution' => round($readRatioScore, 2),
                'category_multiplier' => $categoryFactor
            ]
        ];
    }

    /**
     * Batch re-rank a collection of articles and sort descending by score
     */
    public function rankCollection(array $articles, array $userInterestMap = []): array
    {
        foreach ($articles as &$article) {
            $catId = $article['category_id'] ?? null;
            $affinity = 1.0;
            if ($catId && isset($userInterestMap[$catId])) {
                $affinity = (float)$userInterestMap[$catId];
            }

            $pubTime = isset($article['published_at']) ? strtotime($article['published_at']) : time();
            $rankingData = $this->calculateScore($article, $pubTime, $affinity);

            $article['ranking_score'] = $rankingData['total_score'];
            $article['ranking_details'] = $rankingData;
        }
        unset($article);

        // Sort descending
        usort($articles, function ($a, $b) {
            return ($b['ranking_score'] <=> $a['ranking_score']);
        });

        return $articles;
    }
}
