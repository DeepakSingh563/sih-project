import { Router } from "express";
import authRouter from "./auth";
import routesRouter from "./routes";
import incidentsRouter from "./incidents";
import reportsRouter from "./reports";
import newsRouter from "./news";
import alertsRouter from "./alerts";
import sosRouter from "./sos";
import dashboardRouter from "./dashboard";
import aiRouter from "./ai";

const router = Router();

router.use("/auth", authRouter);
router.use("/routes", routesRouter);
router.use("/incidents", incidentsRouter);
router.use("/reports", reportsRouter);
router.use("/news", newsRouter);
router.use("/alerts", alertsRouter);
router.use("/sos", sosRouter);
router.use("/dashboard", dashboardRouter);
router.use("/ai", aiRouter);

export default router;
