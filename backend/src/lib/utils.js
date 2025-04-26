import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";

export const generateToken = async (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  });

  return token;
};

export const uploadToCloudinary = async (picture, folder) => {
  const myCloud = await cloudinary.v2.uploader.upload(picture, {
    folder: folder,
  });

  return myCloud;
};

export const deleteFromCloudinary = async (public_id) => {
  await cloudinary.v2.uploader.destroy(public_id);
};
