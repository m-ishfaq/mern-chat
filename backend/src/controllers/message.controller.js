import { getReceiverSocketId, io } from "../lib/socket.js";
import { uploadToCloudinary } from "../lib/utils.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsers controller: " + error.message);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: " + error.message);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    let imageId;

    if (image) {
      const uploadResponse = await uploadToCloudinary(image, "chats");
      imageUrl = uploadResponse.secure_url;
      imageId = uploadResponse.public_id;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      file: {
        public_id: imageId,
        url: imageUrl,
      },
    });

    // notify receiver about this msg via socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    // check if user is online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage); // sending alert to receiver about new msg
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in checkAuth controller: " + error.message);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};
