# phia-mock-backend

Production-style mock feed API for the Phia iOS demo. Serves paginated product data with realistic latency; images still load from `cdn.phia.com`.

## Endpoints

- `GET /health`
- `GET /v1/home/trending`
- `GET /v1/home/brands`
- `GET /v1/feed/for-you?cursor=0&limit=24`

## Local dev

```bash
cd api
npm install
npm run dev
```

Server runs on `http://localhost:3000`.
