// modules/tables/table.router.js
import { Router } from "express";
import * as tableController from "./table.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";

const router = Router();

// Public routes
router.get("/available", tableController.getAvailableTables);
router.get("/:id/availability", tableController.checkTableAvailability);
router.get("/", tableController.getTables);
router.get("/:id", tableController.getTableById);

// Protected admin routes
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  tableController.createTable
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  tableController.updateTable
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  tableController.deleteTable
);

export default router;
