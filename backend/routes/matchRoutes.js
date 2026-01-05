import express from "express";
import {
  startMatchmaking,
  getMatchHistory,
  getMatchById,
  getActiveMatch
} from "../controllers/matchController.js";

const router = express.Router();

/* ================= MATCHMAKING ================= */

// Start matchmaking (queue / match)
router.post("/start", startMatchmaking);

// Polling endpoint for Player 1 (check if match created)
router.get("/active/:userId", getActiveMatch);

/* ================= MATCH DATA ================= */

// Match history (completed matches only)
router.get("/history/:userId", getMatchHistory);

// Match details (used by Match Page)
router.get("/:matchId", getMatchById);

export default router;