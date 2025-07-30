import { upsertStramUSer } from "../lib/stream.config.js";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  try {
    // Check if email already exists
    const userAlreadyExist = await userModel.findOne({ email });
    if (userAlreadyExist) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Generate avatar
    const idx = Math.floor(Math.random() * 100) + 1;
    const generateAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    // Create user
    const user = await userModel.create({
      fullname,
      email,
      password, // NOTE: You should hash the password before saving (e.g. using bcrypt)
      profilePic: generateAvatar,
    });

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

   try {
     await upsertStramUSer({
      id:user._id.toString(),
      name:user.fullname,
      image:user.profilePic || ""
    })

    console.log(`Stream user created ${user.fullname}`)
   } catch (error) {
    console.error("Error creating stream user:", error);
   }

    res.status(201).json({ token, user });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, token, user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export function logout(req, res) {
  res.clearCookie("token");
  res.status(200).json({message:"Logout sucessfully"})
}


export async function  onboard(req,res) {
  try {
    const userId = req.user._id

    const {fullname , bio , nativeLanguage , learningLanguage , location} = req.body ;

    if(!fullname || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({ message: "All fields are required" , missingFields:[
        !fullname && "fullname",
        !bio && "bio",
        !nativeLanguage && "nativeLanguage",
        !learningLanguage && "learningLanguage",
        !location && "location",
      ].filter(Boolean),});

      // Update user
    }
    const updateUser = await userModel.findByIdAndUpdate(userId,{
      ...req.body,
       isOnboarded:true
     },{new : true})

    //  check
     if(!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }

   try {
     await upsertStramUSer({
      id:updateUser._id.toString(),
      name:updateUser.fullname,
      image:updateUser.profilePic || ""
    })

    console.log(`Stream user updated on boarding for ${updateUser.fullname}`)

   } catch (streamError) {
    console.error("Error updating stream user:", streamError.message);
   }

    res.status(200).json({success:true , user:updateUser})
  } catch (error) {
    console.error("Onboard error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

