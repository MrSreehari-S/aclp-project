import Match from "../models/Match.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";

/**
 * In-memory queue (Phase 2 only)
 * Later replaced by Redis
 */
let waitingQueue = [];

/* ================= MATCHMAKING ================= */

export const startMatchmaking = async (req, res) => {
  try {
    const { userId } = req.body;

    /* -------------------------
       1. Validate user
    -------------------------- */
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    /* -------------------------
       2. Prevent duplicate queue
    -------------------------- */
    if (waitingQueue.some(u => u.userId.toString() === userId)) {
      return res.json({ status: "already_queued" });
    }

    /* -------------------------
       3. First user → queue
    -------------------------- */
    if (waitingQueue.length === 0) {
      waitingQueue.push({
        userId: currentUser._id,
        username: currentUser.username,
        rating: currentUser.rating
      });

      return res.json({ status: "queued" });
    }

    /* -------------------------
       4. Second user → match
    -------------------------- */
    const waitingUser = waitingQueue.shift();

    /* -------------------------
       5. Select problem
    -------------------------- */
    const problems = await Problem.find({ difficulty: "easy" });
    if (problems.length === 0) {
      return res.status(500).json({ message: "No problems available" });
    }

    const problem =
      problems[Math.floor(Math.random() * problems.length)];

    /* -------------------------
       6. Create match
    -------------------------- */
    const match = await Match.create({
      players: [
        {
          userId: waitingUser.userId,
          username: waitingUser.username,
          rating: waitingUser.rating,
          result: null
        },
        {
          userId: currentUser._id,
          username: currentUser.username,
          rating: currentUser.rating,
          result: null
        }
      ],
      problemId: problem._id,
      status: "ONGOING",
      startedAt: new Date()
    });

    /* -------------------------
       7. Respond
    -------------------------- */
    return res.status(201).json({
      status: "matched",
      matchId: match._id,
      problem: {
        id: problem._id,
        title: problem.title,
        description: problem.description,
        inputFormat: problem.inputFormat,
        outputFormat: problem.outputFormat,
        sampleInput: problem.sampleInput,
        sampleOutput: problem.sampleOutput
      },
      players: match.players
    });

  } catch (err) {
    console.error("Matchmaking error:", err);
    return res.status(500).json({ message: "Matchmaking failed" });
  }
};

/* ================= MATCH HISTORY ================= */

export const getMatchHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    /* 1. Validate user */
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    /* 2. Fetch completed matches */
    const matches = await Match.find({
      status: "COMPLETED",
      "players.userId": userId
    })
      .populate("problemId", "title")
      .sort({ completedAt: -1 });

    /* 3. Shape response */
    const history = matches.map(match => {
      const currentPlayer = match.players.find(
        p => p.userId.toString() === userId
      );

      const opponent = match.players.find(
        p => p.userId.toString() !== userId
      );

      return {
        matchId: match._id,
        date: match.completedAt,
        result: currentPlayer?.result,
        ratingChange: currentPlayer?.ratingChange ?? 0,
        opponent: opponent?.username || "Unknown",
        problem: {
          id: match.problemId._id,
          title: match.problemId.title
        }
      };
    });

    return res.json({ matches: history });

  } catch (err) {
    console.error("Match history error:", err);
    return res.status(500).json({ message: "Failed to fetch match history" });
  }
};
