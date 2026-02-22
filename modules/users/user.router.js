// modules/users/user.router.js
import { Router } from "express";
import * as userController from "./user.controller.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// User profile routes
router.get("/profile", userController.getUserProfile);
router.put("/profile", userController.updateUserProfile);
router.put("/password", userController.changePassword);

// User order history
router.get("/orders", userController.getUserOrderHistory);

export default router;
