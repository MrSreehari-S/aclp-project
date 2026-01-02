import express from "express";
import { getMatchHistory } from "../controllers/matchHistoryController.js";

const router = express.Router();

/**
 * Match history (completed matches only)
 * Auth optional for now
 */
router.get("/history/:userId", getMatchHistory);

export default router;
