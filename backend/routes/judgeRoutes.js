import express from "express";
import { evaluateCode, runSample } from "../controllers/judgeController.js";


const router = express.Router();

router.post("/evaluate", evaluateCode);
router.post("/run-sample", runSample);


export default router;
