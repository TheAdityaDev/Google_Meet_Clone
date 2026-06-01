import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token not provided",
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await userModel
      .findById(decoded.userId)
      .select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};