import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  username: {
    type: String,
    required: true
  },

  rating: {
    type: Number,
    required: true
  },

  result: {
    type: String,
    enum: ["WIN", "LOSS", "DRAW", null],
    default: null
  },

  ratingChange: {
    type: Number,
    default: 0
  }
});

const matchSchema = new mongoose.Schema({
  players: {
    type: [playerSchema],
    validate: {
      validator: (v) => v.length === 2,
      message: "A match must have exactly 2 players"
    }
  },

  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true
  },

  status: {
    type: String,
    enum: ["ONGOING", "COMPLETED"],
    default: "ONGOING"
  },

  startedAt: {
    type: Date,
    default: Date.now
  },

  completedAt: {
    type: Date,
    default: null
  }
});

export default mongoose.model("Match", matchSchema);
