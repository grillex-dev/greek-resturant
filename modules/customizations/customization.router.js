// modules/customizations/customization.router.js
import { Router } from "express";
import * as customizationController from "./customization.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";

const router = Router();

// Public routes - Get all extras and components
router.get("/extras", customizationController.getExtras);
router.get("/components", customizationController.getComponents);

// Protected admin routes - Extras
router.post(
  "/extras",
  authenticate,
  authorize("ADMIN"),
  customizationController.createExtra
);
router.put(
  "/extras/:id",
  authenticate,
  authorize("ADMIN"),
  customizationController.updateExtra
);
router.delete(
  "/extras/:id",
  authenticate,
  authorize("ADMIN"),
  customizationController.deleteExtra
);

// Protected admin routes - Components
router.post(
  "/components",
  authenticate,
  authorize("ADMIN"),
  customizationController.createComponent
);
router.put(
  "/components/:id",
  authenticate,
  authorize("ADMIN"),
  customizationController.updateComponent
);
router.delete(
  "/components/:id",
  authenticate,
  authorize("ADMIN"),
  customizationController.deleteComponent
);

export default router;
