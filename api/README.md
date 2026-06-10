# Phia Mock Backend

Production-style mock feed API for the [Phia iOS demo](https://github.com/sahilelixir/phia-ios-demo). Serves **1,308 products** scraped from Phia editorials with **realistic latency**, **cursor pagination**, and **per-session shuffled feeds**.

Product **images are not hosted here** — the iOS app loads them from `cdn.phia.com` (same CDN as production Phia).

| | |
|---|---|
| **Production URL** | https://phia-mock-backend.onrender.com |
| **Health check** | https://phia-mock-backend.onrender.com/health |

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness + product count |
| `GET` | `/v1/home/trending` | Editorial cards (optional `?shuffle=1`) |
| `GET` | `/v1/home/brands` | Brand spotlights (optional `?shuffle=1`) |
| `GET` | `/v1/feed/for-you` | Paginated feed (`session`, `cursor`, `limit`) |

### Feed pagination

Each new feed session gets a **randomized product order**. Pass `session` on subsequent pages to stay in the same shuffle.

```bash
# First page — server returns sessionId in meta
curl "https://phia-mock-backend.onrender.com/v1/feed/for-you?limit=24"

# Next page
curl "https://phia-mock-backend.onrender.com/v1/feed/for-you?session=UUID&cursor=24&limit=24"
```

Response shape:

```json
{
  "data": [ { "id", "name", "brand", "price", "currency", "imageURL", "source" } ],
  "meta": {
    "cursor": "0",
    "nextCursor": "24",
    "limit": 24,
    "total": 1308,
    "hasMore": true,
    "sessionId": "..."
  },
  "requestId": "..."
}
```

Feed responses use `Cache-Control: no-store` (personalized per session).

---

## Simulated latency

Configurable via environment variables (set in Render dashboard or `render.yaml`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `DELAY_FEED_MS` | 1100 | Feed page delay |
| `DELAY_TRENDING_MS` | 900 | Trending delay |
| `DELAY_BRANDS_MS` | 700 | Brands delay |
| `DELAY_JITTER_MS` | 400 | Random jitter added |

This mimics real API feel so the iOS client can demonstrate prefetch and read-ahead value.

---

## Local development

```bash
cd api
npm install
npm run dev
```

Server listens on `http://localhost:3000`.

Fast local testing (no artificial delay):

```bash
DELAY_FEED_MS=0 DELAY_TRENDING_MS=0 DELAY_BRANDS_MS=0 DELAY_JITTER_MS=0 npm run dev
```

---

## Deploy to Render

1. Push this repo to GitHub.
2. Render → **New Web Service** → connect repo.
3. Settings:
   - **Root Directory:** `api`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
4. Or use the root `render.yaml` Blueprint.

Free tier spins down after inactivity — first request after idle may take 30–60 seconds.

---

## Stack

- Node 20+, TypeScript, Express
- gzip compression, helmet, CORS
- In-memory catalog index (loaded once at boot)
- Session-based feed shuffle (`FeedSessionService`)

---

## Data

Product catalog: `api/data/products.json` — scraped from `phia.com` editorials. Image URLs point to `cdn.phia.com`.

---

## License

Demo / portfolio use. Product data and image URLs belong to Phia. Not affiliated with Phia.
