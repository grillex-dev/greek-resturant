// modules/categories/category.router.js
import { Router } from "express";
import * as categoryController from "./category.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);

// Protected admin routes
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  categoryController.createCategory
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  categoryController.updateCategory
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  categoryController.deleteCategory
);

export default router;
