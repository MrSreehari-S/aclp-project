import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  topic: { type: String, required: true },
  inputFormat: { type: String },
  outputFormat: { type: String },
  sampleInput: { type: String },
  sampleOutput: { type: String },
  hiddenTestCases: [
    {
      input: String,
      expectedOutput: String,
    },
  ],
});

export default mongoose.model("Problem", problemSchema);
