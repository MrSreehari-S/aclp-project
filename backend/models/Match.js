import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  players: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: String,
      rating: Number,
      result: { type: String, default: null }
    }
  ],

  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true
  },

  status: {
    type: String,
    enum: ["ONGOING", "FINISHED"],
    default: "ONGOING"
  },

  startedAt: {
    type: Date,
    default: Date.now
  },

  timeLimit: {
    type: Number,
    default: 120
  }
});


export default mongoose.model("Match", matchSchema);
