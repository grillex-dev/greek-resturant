// modules/categories/category.router.js
import { Router } from "express";
import * as categoryController from "./category.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import {uploadCategoryImage} from "../../utils/upload.js"

const router = Router();

// Public routes
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  uploadCategoryImage,   // optional image upload → attaches req.uploadedImage
  categoryController.createCategory
);
 
router.put(
  "/categories/:id",
  authenticate,
  authorize("ADMIN"),
  uploadCategoryImage,   // optional – only overwrites image when a new file is sent
  categoryController.updateCategory
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  categoryController.deleteCategory
);

export default router;
