import express from "express";
const router = express.Router();
import {
  signup,
  login,
  logout,
  onboard,
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleare.js";

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/onboarding", protectedRoute, onboard);


router.get("/me", protectedRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
