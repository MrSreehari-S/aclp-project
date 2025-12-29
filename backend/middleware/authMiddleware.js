import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ================= REQUIRED AUTH ================= */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, token missing"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    req.user = user; // 🔑 THIS IS CRITICAL
    next();

  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      message: "Not authorized, token invalid"
    });
  }
};

/* ================= OPTIONAL AUTH ================= */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    req.user = user || null;
    next();

  } catch (error) {
    req.user = null;
    next();
  }
};
