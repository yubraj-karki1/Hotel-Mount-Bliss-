import { Router } from "express";
import authRoutes from "./auth.routes.js";
import domainRoutes from "./domain.routes.js";
const router = Router();
router.use("/auth", authRoutes);
router.use(domainRoutes);
export default router;
