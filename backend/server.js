import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import judgeRoutes from "./routes/judgeRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import matchHistoryRoutes from "./routes/matchHistoryRoutes.js";



connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/judge", judgeRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/match", matchHistoryRoutes);
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
