// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    default: "Anonymous"
  },
  rating: {
    type: Number,
    default: 1000
  },
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
