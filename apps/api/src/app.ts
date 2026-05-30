import cors from "cors";
import express from "express";

import { router } from "./routes";
import { errorHandler, notFoundHandler } from "./utils/errors";

export function createApp(): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
