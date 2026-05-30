import { Router } from "express";

import { aiRouter } from "./ai";
import { projectRouter } from "./projects";
import { supplierRouter } from "./suppliers";

export const router = Router();

router.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "zovo-api"
  });
});

router.use("/projects", projectRouter);
router.use("/suppliers", supplierRouter);
router.use("/ai", aiRouter);
