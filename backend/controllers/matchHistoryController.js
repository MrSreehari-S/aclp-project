import Match from "../models/Match.js";
import Problem from "../models/Problem.js";

export const getMatchHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch completed matches where user participated
    const matches = await Match.find({
      status: "COMPLETED",
      "players.userId": userId
    })
      .sort({ completedAt: -1 })
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
        problemTitle: match.problemId?.title || "Unknown",
        completedAt: match.completedAt
      };
    });

    res.json({
      count: history.length,
      history
    });

  } catch (err) {
    console.error("Match history error:", err);
    res.status(500).json({
      message: "Failed to fetch match history"
    });
  }
};
