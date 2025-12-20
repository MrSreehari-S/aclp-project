import express from "express";
import { evaluateCode } from "../controllers/judgeController.js";

const router = express.Router();

router.post("/evaluate", evaluateCode);

export default router;
