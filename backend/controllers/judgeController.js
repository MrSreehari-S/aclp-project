import axios from "axios";
import Problem from "../models/Problem.js";

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions/?base64_encoded=false&wait=true";
const JUDGE0_HEADERS = {
  "Content-Type": "application/json",
  "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
  "x-rapidapi-key": process.env.RAPIDAPI_KEY
};

export const evaluateCode = async (req, res) => {
  try {
    const { problemId, sourceCode, languageId } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    let results = [];
    let passedCount = 0;

    for (const test of problem.hiddenTestCases) {
      const response = await axios.post(JUDGE0_URL, {
        source_code: sourceCode,
        language_id: languageId,
        stdin: test.input,
        expected_output: test.expectedOutput,
      }, { headers: JUDGE0_HEADERS });

      const output = response.data.stdout?.trim() || "";
      const passed = output === test.expectedOutput.trim();

      results.push({
        input: test.input,
        expectedOutput: test.expectedOutput,
        actualOutput: output,
        passed,
      });

      if (passed) passedCount++;
    }

    res.json({
      message: passedCount === problem.hiddenTestCases.length
        ? "All test cases passed ✅"
        : "Some test cases failed ❌",
      passedCount,
      total: problem.hiddenTestCases.length,
      results,
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Code evaluation failed", error: error.message });
  }
};
