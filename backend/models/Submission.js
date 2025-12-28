import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true
  },

  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    default: null
  },

  sourceCode: String,

  verdict: String,

  passedCount: Number,
  totalCount: Number,

  results: Array,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Submission", submissionSchema);
