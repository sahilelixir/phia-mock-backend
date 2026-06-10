import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { requestId } from "./middleware/requestId.js";
import { feedRouter } from "./routes/feed.js";
import { healthRouter } from "./routes/health.js";
import { homeRouter } from "./routes/home.js";
import { CatalogService } from "./services/catalogService.js";

const catalog = new CatalogService();
const app = express();

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: "32kb" }));
app.use(requestId);

app.use(healthRouter(catalog));
app.use(homeRouter(catalog));
app.use(feedRouter(catalog));

app.use((_req, res) => {
  res.status(404).json({
    error: "not_found",
    requestId: res.locals.requestId,
  });
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(
    `[phia-demo-api] listening on 0.0.0.0:${config.port} · ${catalog.totalProducts} products indexed`
  );
});
