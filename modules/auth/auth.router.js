// modules/auth/auth.router.js
import { Router } from "express";
import * as authController from "./auth.controller.js";

const router = Router();

// POST /api/auth/signup - Register new user
router.post("/signup", authController.signUp);

// POST /api/auth/signin - Login existing user
router.post("/signin", authController.signIn);

// POST /api/auth/signout - Logout user
router.post("/signout", authController.signOut);

export default router;
