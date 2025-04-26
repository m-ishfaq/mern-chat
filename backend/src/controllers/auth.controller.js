import bcrypt from "bcryptjs";
import {
  deleteFromCloudinary,
  generateToken,
  uploadToCloudinary,
} from "../lib/utils.js";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
  try {
    const { fullName, password, email } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      });

    if (password.length < 6)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });

    let user = await User.findOne({ email });

    if (user)
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });

    user = await User.create({
      fullName,
      email,
      password,
      avatar: {
        public_id: "",
        url: "",
      },
    });

    if (user) {
      generateToken(user._id, res);

      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Failed to register. Invalid data!" });
    }
  } catch (error) {
    console.log("Error in signup controller: " + error.message);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "Both Fields are required",
      });

    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Wrong credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Wrong credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (error) {
    console.log("Error in signin controller: " + error.message);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });

    res.status(200).json({ success: true, message: "Logout Successfully!" });
  } catch (error) {
    console.log("Error in logout controller: " + error.message);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { picture } = req.body;
    const userId = req.user._id;

    if (!picture)
      return res
        .status(400)
        .json({ success: false, message: "Profile pic is required" });

    if (req.user.avatar.public_id)
      await deleteFromCloudinary(req.user.avatar.public_id);

    const cloudinaryRes = await uploadToCloudinary(picture, "avatar");

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatar: {
          public_id: cloudinaryRes.public_id,
          url: cloudinaryRes.secure_url,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Error in updateProfile controller: " + error.message);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller: " + error.message);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);

  if (!user) return res.status(404).json({ message: "No User Found!" });

  res.status(200).json({ user });
};
