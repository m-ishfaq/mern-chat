import express from "express";
import {
  checkAuth,
  getUserProfile,
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import { isAUthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", isAUthenticated, updateProfile);
router.get("/check", isAUthenticated, checkAuth);
router.get("/get-user/:id", isAUthenticated, getUserProfile);

export default router;
