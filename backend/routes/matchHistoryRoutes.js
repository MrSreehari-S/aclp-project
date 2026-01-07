import express from "express";
import { getMatchHistory } from "../controllers/matchHistoryController.js";

const router = express.Router();

router.get("/history/:userId", getMatchHistory);

export default router;
