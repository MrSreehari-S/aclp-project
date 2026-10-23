import mongoose from "mongoose";
import Match from "../models/Match.js";
import Problem from "../models/Problem.js";

export const getMatchHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // pagination params
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    // total matches count
    const total = await Match.countDocuments({
      status: "COMPLETED",
      "players.userId": userObjectId
    });

    // paginated matches
    const matches = await Match.find({
      status: "COMPLETED",
      "players.userId": userObjectId
    })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("problemId", "title")
      .lean();

    const history = matches.map(match => {
      const self = match.players.find(p =>
        p.userId.toString() === userId
      );

      const opponent = match.players.find(p =>
        p.userId.toString() !== userId
      );

      return {
        matchId: match._id,
        opponent: opponent?.username || "Unknown",
        result: self?.result || "DRAW",
        ratingChange: self?.ratingChange || 0,
        problem: {
          id: match.problemId?._id || null,
          title: match.problemId?.title || "Unknown"
        },
        problemTitle: match.problemId?.title || "Unknown",
        date: match.completedAt
      };
    });

    res.json({
      page,
      limit,
      total,
      matches: history
    });

  } catch (err) {
    console.error("Match history error:", err);
    res.status(500).json({
      message: "Failed to fetch match history"
    });
  }
};