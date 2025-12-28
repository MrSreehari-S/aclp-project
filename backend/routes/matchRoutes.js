import express from "express";
import { startMatchmaking } from "../controllers/matchController.js";

const router = express.Router();

router.post("/start", startMatchmaking);

export default router;
