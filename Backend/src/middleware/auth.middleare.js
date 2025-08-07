import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js"; // adjust the path if needed

export const protectedRoute = async (req, res, next) => {
  try {
    let token;

    // 1. Try to get token from cookies
    if (req.cookies?.token) {
      token = req.cookies.token;
    }
    // 2. Try to get token from Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 3. If no token found, return early
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token not provided" });
    }

    // 4. Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // 5. Find user
    const user = await userModel.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // 6. Attach user to request object and continue
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
