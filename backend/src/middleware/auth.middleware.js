import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const isAUthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token)
      return res.status(401).json({
        success: false,
        message: "Unauthenticated - No Token Provide",
      });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded)
      return res.status(401).json({
        success: false,
        message: "Unauthenticated - Token Invalid",
      });

    const user = await User.findById(decoded.userId);

    if (!user)
      return res.status(404).json({
        success: false,
        message: "No User Found",
      });

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in auth middleware: " + error.message);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};
