import Problem from "../models/Problem.js";

export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().select("-hiddenTestCases");
    res.status(200).json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).select(
      "-hiddenTestCases"
    );
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.status(200).json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addProblem = async (req, res) => {
  try {
    const newProblem = await Problem.create(req.body);
    res
      .status(201)
      .json({ message: "Problem added successfully", problem: newProblem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
