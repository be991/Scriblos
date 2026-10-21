-- ==============================================================================
-- Scriblo Platform Seed Data (High Quality Sample Data)
-- ==============================================================================

USE scriblo_db;

-- Insert Core Categories
INSERT INTO categories (id, name, slug, description, icon) VALUES
(1, 'Engineering & Tech', 'tech', 'Deep dives into distributed systems, AI, web performance, and software craft.', 'cpu'),
(2, 'Writing & Craft', 'writing', 'Techniques for storytelling, prose editing, and building an author brand.', 'feather'),
(3, 'Design & Aesthetics', 'design', 'UI/UX systems, visual harmony, typography, and human-computer interaction.', 'palette'),
(4, 'Startup & Leadership', 'startup', 'Founder lessons, scaling remote teams, and indie publishing economics.', 'rocket'),
(5, 'Future & Culture', 'culture', 'Essays on philosophy, digital consciousness, and modern society.', 'compass')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Sample Authors / Users
INSERT INTO users (id, email, username, full_name, bio, avatar_url, role) VALUES
(1, 'elena.rostova@scriblo.internal', 'elenarostova', 'Elena Rostova', 'Distributed systems architect & essayist. Obsessed with sub-millisecond latencies and clear prose.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80', 'writer'),
(2, 'marcus.vane@scriblo.internal', 'marcusvane', 'Marcus Vane', 'Typographer and product designer. Crafting digital spaces that breathe.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80', 'writer'),
(3, 'clara.thorne@scriblo.internal', 'clarathorne', 'Clara Thorne', 'Tech essayist & indie publishing advocate. Writing on the intersection of AI and human creativity.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80', 'writer')
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- Insert Curated Articles
INSERT INTO articles (id, author_id, category_id, title, slug, subtitle, content_html, content_markdown, cover_image_url, read_time_minutes, status, published_at) VALUES
(1, 1, 1, 'Architecture at Scale: Why Multi-Tier Redis Caching Redefined Our P99 Latency', 'multi-tier-redis-caching-p99-latency', 'How pairing in-memory buffer rings with write-behind persistence eliminated database connection saturation under 50k RPS.', '<p class="lead">When handling high-concurrency editorial platforms, direct database querying is the fastest path to catastrophic cascade failures.</p><p>In our architecture benchmark, raw MySQL connection pooling degraded past 8,000 concurrent reader connections. By introducing an in-memory Redis cluster arranged in read-through cached layers alongside atomic hash counters (<code>HINCRBY</code>), we dropped our P99 read latency from 420ms down to 18ms.</p><h3>The Anatomy of Atomic Buffering</h3><p>Rather than writing engagement metrics (views, claps, read-ratio) directly to relational tables upon every HTTP request, we decouple telemetry writes into atomic Redis hashes. A background cron worker sweeps these hashes in micro-batches every 60 seconds.</p><blockquote>"Sub-50 millisecond delivery is not merely a technical vanity metric; it is the prerequisite for keeping readers immersed in the written word."</blockquote><p>The resulting architecture provides instantaneous content hydration to readers while shielding relational databases from transactional exhaustion.</p>', '# Architecture at Scale: Why Multi-Tier Redis Caching Redefined Our P99 Latency\n\nWhen handling high-concurrency editorial platforms, direct database querying is the fastest path to catastrophic cascade failures...\n\n### The Anatomy of Atomic Buffering\n\nRather than writing engagement metrics directly to relational tables, we decouple telemetry writes into atomic Redis hashes.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80', 6, 'published', NOW() - INTERVAL 4 HOUR),

(2, 2, 3, 'The Quiet Renaissance of Editorial Typography on the Modern Web', 'editorial-typography-renaissance', 'Why fluid variable fonts, proportional line scales, and intentional whitespace create timeless reading comfort.', '<p class="lead">We have spent a decade optimizing websites for glanceability, accidentally sacrificing deep contemplation in the process.</p><p>True editorial typography is an invisible pact between writer and reader. When the line length exceeds 75 characters, eye tracking becomes fatiguing; when leading drops below 1.6, paragraphs coagulate into dense blocks of unapproachable text.</p><h3>The Golden Mean of Digital Prose</h3><p>By pairing high-contrast serif headlines with humanist sans-serif body typefaces and calibrated rem-based vertical rhythms, we restore the tactile luxury of physical journals to glowing screens.</p>', '# The Quiet Renaissance of Editorial Typography on the Modern Web\n\nWe have spent a decade optimizing websites for glanceability, accidentally sacrificing deep contemplation in the process.', 'https://images.unsplash.com/photo-1505682634684-8078b273b0a8?auto=format&fit=crop&w=1200&q=80', 4, 'published', NOW() - INTERVAL 12 HOUR),

(3, 3, 2, 'The 1,000 True Readers Doctrine: Sustainable Independence for Contemporary Writers', '1000-true-readers-doctrine', 'Moving away from algorithmic engagement traps toward direct audience ownership, micro-newsletters, and focused essays.', '<p class="lead">Algorithmic feeds reward outrage and volume. True writing rewards depth and nuance.</p><p>For centuries, the printing press empowered syndicates. Now, passwordless magic links and direct email subscriptions empower solitary writers to sustain vibrant intellectual careers without editorial gatekeepers.</p><h3>Building the Feedback Flywheel</h3><p>Direct interaction through inline reactions and community discourse transforms passive readers into lifelong intellectual patrons.</p>', '# The 1,000 True Readers Doctrine\n\nMoving away from algorithmic engagement traps toward direct audience ownership...', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80', 5, 'published', NOW() - INTERVAL 2 DAY),

(4, 1, 4, 'The Solopreneur Stack: Orchestrating High-Throughput APIs with Zero DevOps Bloat', 'solopreneur-stack-high-throughput', 'How a lean stack of PHP 8.2, Redis, and MySQL outperforms complex distributed microservices for 99% of digital ventures.', '<p class="lead">Premature microservices are the silent killer of early-stage software projects.</p><p>A well-architected monolithic API powered by modern PHP with OPcache, backed by Redis in-memory caches, can comfortably serve millions of daily requests on modest cloud hardware with negligible maintenance overhead.</p>', '# The Solopreneur Stack\n\nHow a lean stack outperforms complex distributed microservices...', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 7, 'published', NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Initial Metrics and Dual-Factor Scores
INSERT INTO article_metrics (article_id, views_count, likes_count, comments_count, bookmarks_count, avg_read_ratio, ranking_score) VALUES
(1, 4280, 312, 48, 185, 0.88, 142.6500),
(2, 2890, 198, 26, 142, 0.92, 115.3200),
(3, 3650, 265, 39, 210, 0.85, 128.4000),
(4, 1920, 134, 18, 92, 0.79, 82.1500)
ON DUPLICATE KEY UPDATE views_count=VALUES(views_count);

-- User Interests Initial Seed for Personalized Recommender
INSERT INTO user_interests (user_id, category_id, affinity_score) VALUES
(1, 1, 5.00),
(1, 3, 3.50),
(2, 3, 5.00),
(2, 2, 4.00),
(3, 2, 5.00),
(3, 4, 3.80)
ON DUPLICATE KEY UPDATE affinity_score=VALUES(affinity_score);
