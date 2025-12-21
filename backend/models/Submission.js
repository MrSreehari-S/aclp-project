import mongoose from "mongoose";

const testCaseResultSchema = new mongoose.Schema({
  input: String,
  expectedOutput: String,
  actualOutput: String,
  verdict: {
    type: String,
    enum: ["AC", "WA", "RE", "TLE"]
  }
});

const submissionSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true
  },

  language: {
    type: String,
    default: "python"
  },

  sourceCode: {
    type: String,
    required: true
  },

  verdict: {
    type: String,
    enum: ["Accepted", "Rejected"],
    required: true
  },

  passedCount: Number,
  totalCount: Number,

  results: [testCaseResultSchema],

  createdAt: {
    type: Date,
    default: Date.now
  },

  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
}

});

export default mongoose.model("Submission", submissionSchema);
