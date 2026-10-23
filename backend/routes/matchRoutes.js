import express from "express";
import {
  startMatchmaking,
  getMatchById,
  getActiveMatch,
} from "../controllers/matchController.js";

const router = express.Router();

router.post("/start", startMatchmaking);

router.get("/active/:userId", getActiveMatch);

router.get("/:matchId", getMatchById);

export default router;
