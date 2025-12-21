import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    default: "Anonymous",
    index: true
  },

  rating: {
    type: Number,
    default: 1000
  },

  // Future-proofing (NOT USED YET)
  email: {
    type: String,
    default: null
  },

  password: {
    type: String,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", userSchema);
