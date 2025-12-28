import User from "../models/User.js";

export const createGuestUser = async (req, res) => {
  try {
    const user = new User({
      username: `Guest_${Date.now()}`
    });

    await user.save();

    res.status(201).json({
      message: "Guest user created",
      userId: user._id,
      username: user.username,
      rating: user.rating
    });
  } catch (error) {
    console.error("Guest user creation failed:", error);
    res.status(500).json({
      message: "Failed to create guest user"
    });
  }
};
