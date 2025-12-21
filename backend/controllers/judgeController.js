import axios from "axios";
import Problem from "../models/Problem.js";

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const TIME_LIMIT_MS = 2000;        // informational (Piston enforces internally)
const MAX_OUTPUT_LENGTH = 10000;  // characters

const languageMap = {
  71: { language: "python", version: "3.10.0", file: "main.py" }
};

/**
 * Classify execution result into verdict
 */
const classifyVerdict = ({ stderr, timedOut }) => {
  if (timedOut) return "TLE";
  if (stderr && stderr.trim() !== "") return "RE";
  return "OK";
};

export const evaluateCode = async (req, res) => {
  try {
    const { problemId, sourceCode, languageId } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const config = languageMap[languageId];
    if (!config) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    let results = [];
    let passedCount = 0;

    for (const test of problem.hiddenTestCases) {
      // 🔒 Python input wrapper (learning-safe)
      const wrappedCode = `
import sys
data = sys.stdin.read().split()
it = iter(data)
def input():
    return next(it)
${sourceCode}
`;

      const response = await axios.post(PISTON_URL, {
        language: config.language,
        version: config.version,
        files: [{ name: config.file, content: wrappedCode }],
        stdin: test.input
      });

      const run = response.data.run;

      let verdict = classifyVerdict({
        stderr: run.stderr,
        timedOut: run.timedOut
      });

      let output = run.stdout?.trim() || "";

      // 🚫 Output limit enforcement
      if (output.length > MAX_OUTPUT_LENGTH) {
        verdict = "RE";
        output =
          output.slice(0, MAX_OUTPUT_LENGTH) +
          "\n[Output truncated]";
      }

      // 🎯 Output comparison only if execution OK
      if (verdict === "OK") {
        const expected = test.expectedOutput.trim();
        verdict = output === expected ? "AC" : "WA";
      }

      if (verdict === "AC") passedCount++;

      results.push({
        input: test.input,
        expectedOutput: test.expectedOutput,
        actualOutput: output,
        verdict
      });
    }

    res.json({
      message:
        passedCount === problem.hiddenTestCases.length
          ? "Accepted"
          : "Rejected",
      passedCount,
      total: problem.hiddenTestCases.length,
      results
    });

  } catch (error) {
    res.status(500).json({
      message: "Code execution failed",
      error: error.message
    });
  }
};

// --------------------
// SAMPLE RUN (NO JUDGE)
// --------------------
export const runSample = async (req, res) => {
  try {
    const { sourceCode, input } = req.body;

    const wrappedCode = `
import sys
data = sys.stdin.read().split()
it = iter(data)
def input():
    return next(it)
${sourceCode}
`;

    const response = await axios.post(PISTON_URL, {
      language: "python",
      version: "3.10.0",
      files: [{ name: "main.py", content: wrappedCode }],
      stdin: input
    });

    res.json({
      output: response.data.run.stdout || ""
    });
  } catch (err) {
    res.status(500).json({
      output: "Error executing sample input"
    });
  }
};
