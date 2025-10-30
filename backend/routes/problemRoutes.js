import express from "express";
import { getAllProblems, getProblemById, addProblem } from "../controllers/problemController.js";

const router = express.Router();

router.get("/", getAllProblems);
router.get("/:id", getProblemById);
router.post("/", addProblem);

export default router;
