import express from "express";

import {
  createUser,
  getUsers,
  loginUser,
  sendRequest,
  signInWithApple,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"; // Import the middleware

const router = express.Router();

router.post("/create-account", createUser);
router.post("/login", loginUser);
router.post("/apple", signInWithApple);

export default router;
