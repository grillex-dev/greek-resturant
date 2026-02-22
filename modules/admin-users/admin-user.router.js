// modules/admin-users/admin-user.router.js
import { Router } from "express";
import * as adminUserController from "./admin-user.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";

const router = Router();

// All admin user routes require authentication and admin role
router.use(authenticate);
router.use(authorize("ADMIN"));

// Admin user management routes
router.get("/stats", adminUserController.getUserStats);
router.get("/", adminUserController.getAllUsers);
router.get("/:id", adminUserController.getUserById);
router.put("/:id/role", adminUserController.updateUserRole);
router.delete("/:id", adminUserController.deleteUser);

export default router;
