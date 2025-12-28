import Match from "../models/Match.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";

let waitingQueue = [];

export const startMatchmaking = async (req, res) => {
  try {
    const { userId } = req.body;

    // 1. Validate user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Check if already queued
    if (waitingQueue.find(u => u.userId.toString() === userId)) {
      return res.json({ status: "already_queued" });
    }

    // 3. If queue empty → push and wait
    if (waitingQueue.length === 0) {
      waitingQueue.push({
        userId: currentUser._id,
        username: currentUser.username,
        rating: currentUser.rating
      });

      return res.json({ status: "queued" });
    }

    // 4. Match found
    const waitingUser = waitingQueue.shift();

    // 5. Select problem
    const problems = await Problem.find({ difficulty: "easy" });
    if (problems.length === 0) {
      return res.status(500).json({ message: "No problems available" });
    }

    const problem =
      problems[Math.floor(Math.random() * problems.length)];

    // 6. Create match
    const match = await Match.create({
      players: [
        {
          userId: waitingUser.userId,
          username: waitingUser.username,
          rating: waitingUser.rating
        },
        {
          userId: currentUser._id,
          username: currentUser.username,
          rating: currentUser.rating
        }
      ],
      problemId: problem._id
    });

    // 7. Respond
    res.status(201).json({
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
    res.status(500).json({ message: "Matchmaking failed" });
  }
};
