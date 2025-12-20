import axios from "axios";
import Problem from "../models/Problem.js";

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

/**
 * Maps languageId (frontend/backend choice) to Piston language config
 */
const languageMap = {
  71: { language: "python", version: "3.10.0", file: "main.py" }, // Python 3
  54: { language: "cpp", version: "10.2.0", file: "main.cpp" }    // C++
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
      const response = await axios.post(PISTON_URL, {
        language: config.language,
        version: config.version,
        files: [
          {
            name: config.file,
            content: sourceCode
          }
        ],
        stdin: test.input
      });

      const output = response.data.run.stdout?.trim() || "";
      const expected = test.expectedOutput.trim();
      const passed = output === expected;

      if (passed) passedCount++;

      results.push({
        input: test.input,
        expectedOutput: expected,
        actualOutput: output,
        passed
      });
    }

    res.json({
      message:
        passedCount === problem.hiddenTestCases.length
          ? "All test cases passed ✅"
          : "Some test cases failed ❌",
      passedCount,
      total: problem.hiddenTestCases.length,
      results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Code execution failed",
      error: error.message
    });
  }
};
