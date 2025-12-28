import User from "../models/User.js";

export const getLeaderboard = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();

    const users = await User.find({})
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit)
      .select("username rating");

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      username: user.username,
      rating: user.rating
    }));

    res.json({
      page,
      limit,
      totalUsers,
      users: leaderboard
    });

  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};
