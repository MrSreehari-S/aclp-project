import express from "express";
import { evaluateCode, runSample } from "../controllers/judgeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/run-sample", protect, runSample);
router.post("/evaluate", protect, evaluateCode);

export default router;
