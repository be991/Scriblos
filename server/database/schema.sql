-- ==============================================================================
-- Scriblo Platform Relational Schema (MySQL 8.0+)
-- Supports: Caching Invalidation, Dual-Factor Ranking, Recommendation Vectors
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS scriblo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE scriblo_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(64) NOT NULL UNIQUE,
    full_name VARCHAR(128) NOT NULL,
    bio TEXT NULL,
    avatar_url VARCHAR(512) NULL,
    role ENUM('reader', 'writer', 'admin') DEFAULT 'writer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_username (username)
) ENGINE=InnoDB;

-- 2. Article Categories & Topic Taxonomy
CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    slug VARCHAR(64) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    icon VARCHAR(64) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category_slug (slug)
) ENGINE=InnoDB;

-- 3. Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    author_id BIGINT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(280) NOT NULL UNIQUE,
    subtitle VARCHAR(500) NULL,
    content_html MEDIUMTEXT NOT NULL,
    content_markdown MEDIUMTEXT NULL,
    cover_image_url VARCHAR(512) NULL,
    read_time_minutes INT UNSIGNED DEFAULT 1,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_article_status_published (status, published_at),
    INDEX idx_article_category (category_id),
    INDEX idx_article_author (author_id),
    FULLTEXT INDEX idx_fulltext_title_subtitle (title, subtitle)
) ENGINE=InnoDB;

-- 4. Article Dual-Factor Performance Metrics (Synced asynchronously from Redis)
CREATE TABLE IF NOT EXISTS article_metrics (
    article_id BIGINT UNSIGNED PRIMARY KEY,
    views_count BIGINT UNSIGNED DEFAULT 0,
    likes_count BIGINT UNSIGNED DEFAULT 0,
    comments_count INT UNSIGNED DEFAULT 0,
    bookmarks_count INT UNSIGNED DEFAULT 0,
    avg_read_ratio DECIMAL(5,2) DEFAULT 0.00,
    ranking_score DECIMAL(10,4) DEFAULT 0.0000,
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_ranking_score (ranking_score DESC),
    INDEX idx_views_count (views_count DESC)
) ENGINE=InnoDB;

-- 5. User Engagement Ledger (Claps, Bookmarks, Read Completes)
CREATE TABLE IF NOT EXISTS user_engagements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    article_id BIGINT UNSIGNED NOT NULL,
    type ENUM('like', 'bookmark', 'read_complete') NOT NULL,
    read_dwell_seconds INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_article_type (user_id, article_id, type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_engagement_type (type)
) ENGINE=InnoDB;

-- 6. User Topic Interests Vector (Used by Content Recommendation Engine)
CREATE TABLE IF NOT EXISTS user_interests (
    user_id BIGINT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    affinity_score DECIMAL(5,2) DEFAULT 1.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Passwordless Magic Link & Token Ledger (Backup persistence; primary resides in Redis)
CREATE TABLE IF NOT EXISTS magic_auth_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token_hash (token_hash),
    INDEX idx_email_expires (email, expires_at)
) ENGINE=InnoDB;

-- 8. Writer Followers / Newsletter Subscribers
CREATE TABLE IF NOT EXISTS author_subscribers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    author_id BIGINT UNSIGNED NOT NULL,
    subscriber_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_author_subscriber (author_id, subscriber_email),
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
