// modules/products/product.router.js
import { Router } from "express";
import * as productController from "./product.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { uploadProductImage } from "../../config/upload.js";

const router = Router();

// Public routes
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

// Protected admin routes
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  uploadProductImage,
  productController.createProduct
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  uploadProductImage,
  productController.updateProduct
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  productController.deleteProduct
);
router.patch(
  "/:id/toggle",
  authenticate,
  authorize("ADMIN"),
  productController.toggleProductStatus
);

export default router;
