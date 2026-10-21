# 🖋️ Scriblo — Empowering Independent Writers

> **High-Performance Editorial & Publishing Platform**  
> Built with **React**, **PHP 8.2**, **Redis**, **MySQL**, and **AWS Architecture Ready**.

---

## 🌟 Overview & Core Innovations

Scriblo is an editorial publishing platform engineered for extreme performance, reader personalization, and writer empowerment:

1. **Multi-Tier Caching System (PHP + MySQL + Redis)**:
   - Delivers content with **sub-50ms read latencies** using Redis read-through caching.
   - Decouples write bottlenecks using atomic Redis hashes (`HINCRBY`) to buffer views, claps/likes, and dwell metrics before flushing to MySQL.
2. **Personalized Article Recommendation Engine**:
   - Matches user topic interest vectors against article taxonomy and completion history using hybrid cosine/affinity matching.
   - Dynamic interest tuning via the onboard topic selector.
3. **Passwordless Magic Link Authentication**:
   - Zero-password friction: generates cryptographically secure single-use tokens stored in Redis with 15-minute TTL.
4. **Dual-Factor Article Ranking System**:
   - Balances multi-signal engagement velocity ($views, claps, comments, bookmarks, completion$) with category relevance, adjusted by a continuous time-decay gravity formula:
     $$\text{Score} = \frac{\text{Factored Engagement}}{(T + 2)^{1.4}}$$
5. **Standout Editorial Features**:
   - **Distraction-Free Writer Studio**: Real-time word count, read time estimator, draft local-cache auto-saving, and projected dual-factor freshness score.
   - **Dynamic Reader Mode**: Font size scaling, Serif vs Sans toggle, reading progress bar, Light / Parchment Sepia / Dark themes, and **Web Speech API Audio Narrator**.
   - **Writer Studio Analytics**: Interactive KPI breakdown, daily read vs completion volume bar charts, and category audience distribution.

---

## 📂 Repository Architecture

```
Scriblos/
├── client/                     # React Frontend (Vite + Modern Vanilla CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigation, theme cycler, Redis P99 pill
│   │   │   ├── ArticleCard.jsx         # Card with dual-factor score & claps
│   │   │   ├── ReaderMode.jsx          # Immersive reader + Web Speech TTS
│   │   │   ├── DistractionFreeEditor.jsx # Writer studio & draft auto-saver
│   │   │   ├── WriterAnalytics.jsx     # Visual charts & KPI metrics
│   │   │   ├── MagicAuthModal.jsx      # Passwordless magic auth flow
│   │   │   └── TopicOnboardingModal.jsx # Recommendation interest tuner
│   │   ├── services/
│   │   │   └── api.js                  # Hybrid client with full-fidelity emulation
│   │   ├── styles/
│   │   │   └── index.css               # Luxury editorial design system
│   │   ├── App.jsx                     # Core application coordinator
│   │   └── main.jsx
│   └── package.json
│
├── server/                     # High-Throughput PHP 8.2 Backend
│   ├── public/
│   │   └── index.php           # Front controller & REST API router
│   ├── src/
│   │   └── Services/
│   │       ├── RedisCacheService.php    # Read-through cache & atomic buffers
│   │       ├── DualFactorRanker.php     # Ranking math & gravity decay
│   │       ├── RecommendationEngine.php # Vector interest matching
│   │       └── EmailAuthService.php     # Magic token generation & verify
│   ├── database/
│   │   ├── schema.sql          # MySQL 8.0 relational schema & indexing
│   │   └── seeds.sql           # Curated seed articles, authors & metrics
│   ├── config/
│   │   ├── database.php        # MySQL PDO config
│   │   ├── redis.php           # Redis host/port config
│   │   └── aws.php             # AWS S3 & SES config
│   └── composer.json
│
├── docker-compose.yml          # Container orchestration (PHP-FPM, Nginx, Redis, MySQL)
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Launching the React Client (Local Development)

```bash
cd client
npm install
npm run dev
```
Open **[http://127.0.0.1:5173/](http://127.0.0.1:5173/)** in your browser.

> [!TIP]
> The React client includes a zero-friction fallback adapter. You can test the Dual-Factor Ranking, Recommendation Engine, Reader Mode with Audio Narrator, and Passwordless Sign-In instantly without needing external daemons running!

### 2. Launching Full-Stack Services with Docker Compose

When Docker is running, launch the entire containerized architecture (PHP 8.2-FPM, NGINX, Redis 7, MySQL 8, and React):

```bash
docker compose up -d
```
- **React Frontend**: [http://localhost:5173](http://localhost:5173)
- **PHP REST API**: [http://localhost:8080/api/feed/trending](http://localhost:8080/api/feed/trending)
- **Redis**: Port `6379`
- **MySQL**: Port `3306`

---

## 🔬 Mathematical Ranking & Recommendation Details

### Dual-Factor Formula
$$\text{Engagement} = 0.8 \cdot \ln(1 + V) + 3.5 \cdot L + 6.0 \cdot C + 4.0 \cdot B + 12.0 \cdot R \times 10$$
$$\text{Score} = \frac{\text{Engagement} \times \text{CategoryFactor}}{(T + 2)^{1.4}}$$
Where:
- $V$: Views (log-scaled)
- $L$: Claps/Likes
- $C$: Comments
- $B$: Bookmarks
- $R$: Average Read-Through Ratio ($0.0 \to 1.0$)
- $T$: Elapsed hours since publication
- Gravity: $1.4$ for balanced time decay
