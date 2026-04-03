import Match from "../models/Match.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js"; // ✅ IMPORTANT

import { getDifficultyFromRating } from "../utils/difficulty.js";
import { getTimeLimit } from "../utils/timeConfig.js";

let waitingQueue = [];

// ================= MATCHMAKING =================

export const startMatchmaking = async (req, res) => {
  try {
    const { userId } = req.body;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const activeMatch = await Match.findOne({
      status: "ONGOING",
      "players.userId": userId,
    });

    if (activeMatch) {
      return res.json({
        status: "already_in_match",
        matchId: activeMatch._id,
      });
    }

    if (waitingQueue.some((u) => u.userId.toString() === userId)) {
      return res.json({ status: "already_queued" });
    }

    if (waitingQueue.length === 0) {
      waitingQueue.push({
        userId: currentUser._id,
        username: currentUser.username,
        rating: currentUser.rating,
      });

      return res.json({ status: "queued" });
    }

    const waitingUser = waitingQueue.shift();

    if (waitingUser.userId.toString() === userId) {
      return res.json({ status: "queued" });
    }

    // ================= DIFFICULTY =================

    const avgRating = Math.round(
      (waitingUser.rating + currentUser.rating) / 2
    );

    const difficulty = getDifficultyFromRating(avgRating);

    let problems = await Problem.find({ difficulty });

    if (problems.length === 0) {
      console.warn("No problems for difficulty:", difficulty);
      problems = await Problem.find();
    }

    if (problems.length === 0) {
      return res.status(500).json({ message: "No problems available" });
    }

    const problem =
      problems[Math.floor(Math.random() * problems.length)];

    const timeLimit = getTimeLimit(problem.difficulty);

    const match = await Match.create({
      players: [
        {
          userId: waitingUser.userId,
          username: waitingUser.username,
          rating: waitingUser.rating,
          result: null,
          ratingChange: 0,
        },
        {
          userId: currentUser._id,
          username: currentUser.username,
          rating: currentUser.rating,
          result: null,
          ratingChange: 0,
        },
      ],
      problemId: problem._id,
      status: "ONGOING",
      startTime: new Date(),
      timeLimit,
    });

    return res.status(201).json({
      status: "matched",
      matchId: match._id,
    });
  } catch (err) {
    console.error("Matchmaking error:", err);
    return res.status(500).json({ message: "Matchmaking failed" });
  }
};

// ================= ACTIVE MATCH =================

export const getActiveMatch = async (req, res) => {
  try {
    const { userId } = req.params;

    const match = await Match.findOne({
      status: "ONGOING",
      "players.userId": userId,
    });

    if (!match) {
      return res.json({ match: null });
    }

    return res.json({
      match: {
        matchId: match._id,
      },
    });
  } catch (err) {
    console.error("Active match error:", err);
    return res.status(500).json({ message: "Failed to check active match" });
  }
};

// ================= MATCH HISTORY =================

export const getMatchHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const matches = await Match.find({
      status: "COMPLETED",
      "players.userId": userId,
    })
      .populate("problemId", "title")
      .sort({ completedAt: -1 });

    const history = matches.map((match) => {
      const me = match.players.find(
        (p) => p.userId.toString() === userId
      );
      const opponent = match.players.find(
        (p) => p.userId.toString() !== userId
      );

      return {
        matchId: match._id,
        date: match.completedAt,
        result: me?.result,
        ratingChange: me?.ratingChange ?? 0,
        opponent: opponent?.username,
        problem: {
          id: match.problemId._id,
          title: match.problemId.title,
        },
      };
    });

    return res.json({ matches: history });
  } catch (err) {
    console.error("Match history error:", err);
    return res.status(500).json({ message: "Failed to fetch match history" });
  }
};

// ================= GET MATCH =================

export const getMatchById = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId).populate("problemId", {
      title: 1,
      description: 1,
      inputFormat: 1,
      outputFormat: 1,
      sampleInput: 1,
      sampleOutput: 1,
    });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // ================= AUTO TIMEOUT FIX =================

    if (match.status === "ONGOING") {
      const now = new Date();
      const endTime = new Date(
        match.startTime.getTime() + match.timeLimit * 1000
      );

      if (now > endTime) {
        const submissions = await Submission.find({ matchId });

        if (submissions.length === 0) {
          // BOTH DID NOT SUBMIT → DRAW
          match.players.forEach((p) => {
            p.result = "DRAW";
            p.ratingChange = 0;
          });
        } else if (submissions.length === 1) {
          // ONE SUBMITTED → WIN / LOSS
          const submittedUserId = submissions[0].userId.toString();

          match.players.forEach((p) => {
            if (p.userId.toString() === submittedUserId) {
              p.result = "WIN";
            } else {
              p.result = "LOSS";
            }
            p.ratingChange = 0;
          });
        }

        match.status = "COMPLETED";
        match.completedAt = new Date();

        await match.save();
      }
    }

    return res.json({
      matchId: match._id,
      status: match.status,
      startTime: match.startTime,
      timeLimit: match.timeLimit,
      completedAt: match.completedAt || null,
      players: match.players,
      problem: {
        id: match.problemId._id,
        title: match.problemId.title,
        description: match.problemId.description,
        inputFormat: match.problemId.inputFormat,
        outputFormat: match.problemId.outputFormat,
        sampleInput: match.problemId.sampleInput,
        sampleOutput: match.problemId.sampleOutput,
      },
    });
  } catch (err) {
    console.error("Get match error:", err);
    return res.status(500).json({ message: "Failed to fetch match" });
  }
};