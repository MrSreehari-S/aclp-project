import express from "express";
import { evaluateCode, runSample } from "../controllers/judgeController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/evaluate", protect, evaluateCode);
router.post("/run-sample", protect, runSample);



export default router;
