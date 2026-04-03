import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  topic: { type: String, required: true },
  inputFormat: { type: String },
  outputFormat: { type: String },
  sampleInput: { type: String },
  sampleOutput: { type: String },
  difficulty: {
    type: String,
    enum: ["EASY", "MEDIUM", "HARD", "EXPERT"],
    required: true,
  },
  hiddenTestCases: [
    {
      input: String,
      expectedOutput: String,
    },
  ],
});

export default mongoose.model("Problem", problemSchema);
