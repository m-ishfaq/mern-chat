import express from "express";
import { isAUthenticated } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsers,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", isAUthenticated, getUsers);
router.get("/:id", isAUthenticated, getMessages);

router.post("/send/:id", isAUthenticated, sendMessage);

export default router;
