import express from "express";
import {
  startMatchmaking,
  getMatchHistory
} from "../controllers/matchController.js";

const router = express.Router();

router.post("/start", startMatchmaking);
router.get("/history/:userId", getMatchHistory);

export default router;
