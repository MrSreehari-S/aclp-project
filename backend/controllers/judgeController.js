import axios from "axios";
import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import Match from "../models/Match.js";

/* ================= CONFIG ================= */

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";
const MAX_OUTPUT_LENGTH = 10000;
const K = 32;

const languageMap = {
  71: { language: "python", version: "3.10.0", file: "main.py" }
};

/* ================= HELPERS ================= */

// Beginner-safe Python wrapper
const wrapPythonCode = (code) => `
import sys
data = sys.stdin.read().split()
it = iter(data)
def input():
    return next(it)
${code}
`;

// Detect advanced input handling
const isAdvancedPython = (code) =>
  code.includes("input().split") ||
  code.includes("sys.stdin");

// Verdict classifier
const classifyVerdict = (run, expected) => {
  const stdout = (run.stdout || "").trim();
  const stderr = (run.stderr || "").trim();

  if (run.timedOut) return { verdict: "TLE", output: "" };

  // Only treat stderr as error if nothing printed
  if (stderr && !stdout) return { verdict: "RE", output: "" };

  if (stdout === expected.trim())
    return { verdict: "AC", output: stdout };

  return { verdict: "WA", output: stdout };
};

// Elo helpers
const expectedScore = (ra, rb) =>
  1 / (1 + Math.pow(10, (rb - ra) / 400));

const calculateElo = (ra, rb, scoreA) =>
  Math.round(ra + K * (scoreA - expectedScore(ra, rb)));

/* ================= EVALUATE CODE ================= */

export const evaluateCode = async (req, res) => {
  try {
    const { userId, matchId, problemId, sourceCode, languageId } = req.body;

    /* ---- Validation ---- */

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });
    if (match.status !== "ONGOING")
      return res.status(403).json({ message: "Match finished" });

    const problem = await Problem.findById(problemId);
    if (!problem)
      return res.status(404).json({ message: "Problem not found" });

    const config = languageMap[languageId];
    if (!config)
      return res.status(400).json({ message: "Unsupported language" });

    /* ---- Run Test Cases ---- */

    const advancedPython = isAdvancedPython(sourceCode);
    let passedCount = 0;
    const results = [];

    for (const test of problem.hiddenTestCases) {
      const response = await axios.post(PISTON_URL, {
        language: config.language,
        version: config.version,
        files: [
          {
            name: config.file,
            content: advancedPython
              ? sourceCode
              : wrapPythonCode(sourceCode)
          }
        ],
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

    /* ---- Save Submission ---- */

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

    /* ---- Elo + Match Resolution ---- */

    const submissions = await Submission.find({ matchId });

    if (submissions.length === 2) {
      const [s1, s2] = submissions;

      const p1 = await User.findById(s1.userId);
      const p2 = await User.findById(s2.userId);

      let score1 = 0.5;
      let score2 = 0.5;

      if (s1.verdict === "Accepted" && s2.verdict !== "Accepted") {
        score1 = 1; score2 = 0;
      }
      if (s2.verdict === "Accepted" && s1.verdict !== "Accepted") {
        score2 = 1; score1 = 0;
      }

      const newR1 = calculateElo(p1.rating, p2.rating, score1);
      const newR2 = calculateElo(p2.rating, p1.rating, score2);

      const delta1 = newR1 - p1.rating;
      const delta2 = newR2 - p2.rating;

      p1.rating = newR1;
      p2.rating = newR2;

      await p1.save();
      await p2.save();

      match.players.forEach(p => {
        if (p.userId.equals(p1._id)) {
          p.result = score1 === 1 ? "WIN" : score1 === 0 ? "LOSS" : "DRAW";
          p.ratingChange = delta1;
        }
        if (p.userId.equals(p2._id)) {
          p.result = score2 === 1 ? "WIN" : score2 === 0 ? "LOSS" : "DRAW";
          p.ratingChange = delta2;
        }
      });

      match.status = "COMPLETED";
      match.completedAt = new Date();
      await match.save();
    }

    /* ---- Response ---- */

    res.json({
      submissionId: submission._id,
      verdict: finalVerdict,
      passedCount,
      total: problem.hiddenTestCases.length,
      matchStatus: match.status,
      results
    });

  } catch (err) {
    console.error("Judge error:", err);
    res.status(500).json({ message: "Code execution failed" });
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
      files: [
        {
          name: "main.py",
          content: advancedPython
            ? sourceCode
            : wrapPythonCode(sourceCode)
        }
      ],
      stdin: input
    });

    res.json({
      output: response.data.run.stdout || ""
    });

  } catch (err) {
    console.error("Sample run error:", err);
    res.status(500).json({ output: "Error executing sample" });
  }
};
