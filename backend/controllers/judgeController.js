import axios from "axios";
import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";
import Match from "../models/Match.js";
import User from "../models/User.js"; // ✅ FIX 1: REQUIRED IMPORT

/* ================= CONFIG ================= */

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";
const MAX_OUTPUT_LENGTH = 10000;
const K = 32;
const SUBMISSION_COOLDOWN_MS = 5000;

const languageMap = {
  71: { language: "python", version: "3.10.0", file: "main.py" }
};

/* ================= HELPERS ================= */

const wrapPythonCode = (code) => `
import sys
data = sys.stdin.read().split()
it = iter(data)
def input():
    return next(it)
${code}
`;

const isAdvancedPython = (code) =>
  code.includes("input().split") || code.includes("sys.stdin");

const classifyVerdict = (run, expected) => {
  const stdout = (run.stdout || "").trim();
  const stderr = (run.stderr || "").trim();

  if (run.timedOut) return { verdict: "TLE", output: "" };
  if (stderr && !stdout) return { verdict: "RE", output: "" };
  if (stdout === expected.trim()) return { verdict: "AC", output: stdout };

  return { verdict: "WA", output: stdout };
};

const expectedScore = (ra, rb) =>
  1 / (1 + Math.pow(10, (rb - ra) / 400));

const calculateElo = (ra, rb, scoreA) =>
  Math.round(ra + K * (scoreA - expectedScore(ra, rb)));

/* ================= EVALUATE CODE ================= */

export const evaluateCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const { matchId, problemId, sourceCode, languageId } = req.body;

    /* -------- Match Validation -------- */

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.status !== "ONGOING") {
      return res.status(403).json({ message: "Match finished" });
    }

    const isPlayer = match.players.some(p =>
      p.userId.equals(userId)
    );

    if (!isPlayer) {
      return res.status(403).json({
        message: "You are not a participant in this match"
      });
    }

    /* -------- Problem Validation -------- */

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const config = languageMap[languageId];
    if (!config) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    /* -------- Submission Limits -------- */

    const existingSubmission = await Submission.findOne({
      userId,
      matchId
    });

    if (existingSubmission) {
      return res.status(429).json({
        message: "Submission already made for this match"
      });
    }

    const lastSubmission = await Submission.findOne({ userId })
      .sort({ createdAt: -1 });

    if (lastSubmission) {
      const diff =
        Date.now() - new Date(lastSubmission.createdAt).getTime();

      if (diff < SUBMISSION_COOLDOWN_MS) {
        return res.status(429).json({
          message: "Too many submissions. Please wait a few seconds."
        });
      }
    }

    /* -------- Run Judge -------- */

    const advancedPython = isAdvancedPython(sourceCode);
    let passedCount = 0;
    const results = [];

    for (const test of problem.hiddenTestCases) {
      const response = await axios.post(PISTON_URL, {
        language: config.language,
        version: config.version,
        files: [{
          name: config.file,
          content: advancedPython
            ? sourceCode
            : wrapPythonCode(sourceCode)
        }],
        stdin: test.input
      });

      const run = response.data.run;
      const { verdict, output } = classifyVerdict(
        run,
        test.expectedOutput
      );

      if (verdict === "AC") passedCount++;

      results.push({
        input: test.input,
        expectedOutput: test.expectedOutput,
        actualOutput:
          output.length > MAX_OUTPUT_LENGTH
            ? output.slice(0, MAX_OUTPUT_LENGTH) + "\n[Truncated]"
            : output,
        verdict
      });
    }

    const finalVerdict =
      passedCount === problem.hiddenTestCases.length
        ? "Accepted"
        : "Rejected";

    /* -------- Save Submission -------- */

    const submission = await Submission.create({
      userId,
      matchId,
      problemId,
      sourceCode,
      verdict: finalVerdict,
      passedCount,
      totalCount: problem.hiddenTestCases.length,
      results
    });

    /* -------- Elo + Match Resolution -------- */

    const submissions = await Submission.find({ matchId });

    if (submissions.length === 2) {
      const [s1, s2] = submissions;

      const p1 = match.players.find(p => p.userId.equals(s1.userId));
      const p2 = match.players.find(p => p.userId.equals(s2.userId));

      // ✅ FIX 2: Defensive guard
      if (!p1 || !p2) {
        console.error("Match resolution error: players not found");
        return res.status(500).json({
          message: "Match resolution failed"
        });
      }

      const user1 = await User.findById(p1.userId);
      const user2 = await User.findById(p2.userId);

      if (!user1 || !user2) {
        console.error("Elo error: users not found");
        return res.status(500).json({
          message: "User resolution failed"
        });
      }

      let score1 = 0.5;
      let score2 = 0.5;

      if (s1.verdict === "Accepted" && s2.verdict !== "Accepted") {
        score1 = 1; score2 = 0;
      }
      if (s2.verdict === "Accepted" && s1.verdict !== "Accepted") {
        score2 = 1; score1 = 0;
      }

      const newR1 = calculateElo(user1.rating, user2.rating, score1);
      const newR2 = calculateElo(user2.rating, user1.rating, score2);

      const delta1 = newR1 - user1.rating;
      const delta2 = newR2 - user2.rating;

      user1.rating = newR1;
      user2.rating = newR2;

      await user1.save();
      await user2.save();

      // ✅ FIX 3: Persist results properly
      p1.result = score1 === 1 ? "WIN" : score1 === 0 ? "LOSS" : "DRAW";
      p2.result = score2 === 1 ? "WIN" : score2 === 0 ? "LOSS" : "DRAW";
      p1.ratingChange = delta1;
      p2.ratingChange = delta2;

      match.status = "COMPLETED";
      match.completedAt = new Date();
      await match.save();
    }

    return res.json({
      submissionId: submission._id,
      verdict: finalVerdict,
      passedCount,
      total: problem.hiddenTestCases.length,
      matchStatus: match.status,
      results
    });

  } catch (err) {
    console.error("Judge error:", err);
    return res.status(500).json({
      message: "Code execution failed"
    });
  }
};

/* ================= RUN SAMPLE ================= */

export const runSample = async (req, res) => {
  try {
    const { sourceCode, input } = req.body;

    const advancedPython = isAdvancedPython(sourceCode);

    const response = await axios.post(PISTON_URL, {
      language: "python",
      version: "3.10.0",
      files: [{
        name: "main.py",
        content: advancedPython
          ? sourceCode
          : wrapPythonCode(sourceCode)
      }],
      stdin: input
    });

    return res.json({
      output: response.data.run.stdout || ""
    });

  } catch (err) {
    console.error("Sample run error:", err);
    return res.status(500).json({
      output: "Error executing sample"
    });
  }
};
