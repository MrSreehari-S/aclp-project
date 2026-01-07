import express from "express";
import {
  startMatchmaking,
  getMatchHistory,
  getMatchById,
  getActiveMatch,
} from "../controllers/matchController.js";

const router = express.Router();

router.post("/start", startMatchmaking);

router.get("/active/:userId", getActiveMatch);

router.get("/history/:userId", getMatchHistory);

router.get("/:matchId", getMatchById);

export default router;
