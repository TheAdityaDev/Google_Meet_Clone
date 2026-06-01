import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const avatarId = Math.floor(Math.random() * 100) + 1;
    const profilePic = `https://avatar.iran.liara.run/public/${avatarId}.png`;

    const user = await userModel.create({
      fullname,
      email,
      password,
      profilePic,
    });

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await userModel.findOne({ email }).select("+password");

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, token, user: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export function logout(req, res) {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    const {
      fullname,
      bio,
      nativeLanguage,
      learningLanguage,
      location,
      profilePic,
    } = req.body;

    if (
      !fullname ||
      !bio ||
      !nativeLanguage ||
      !learningLanguage ||
      !location
    ) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullname && "fullname",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updateUser = await userModel.findByIdAndUpdate(
      userId,
      {
        fullname,
        bio,
        nativeLanguage,
        learningLanguage,
        location,
        profilePic,
        isOnboarded: true,
      },
      { new: true },
    );

    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, user: updateUser });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
