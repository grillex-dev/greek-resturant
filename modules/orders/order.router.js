// modules/orders/order.router.js
import { Router } from "express";
import * as orderController from "./order.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";

const router = Router();

// ====================== PUBLIC / GUEST ROUTES ======================

// Guest + Authenticated users can create order
router.post("/", orderController.createOrder);   // ← Removed authenticate middleware

// Authenticated customer routes
router.get("/", authenticate, orderController.getUserOrders);
router.get("/:id", authenticate, orderController.getOrderById);

// ====================== ADMIN ROUTES ======================
router.get(
  "/admin/all",
  authenticate,
  authorize("ADMIN"),
  orderController.getAllOrders
);
router.get(
  "/admin/stats",
  authenticate,
  authorize("ADMIN"),
  orderController.getOrderStats
);
router.get(
  "/admin/:id",
  authenticate,
  authorize("ADMIN"),
  orderController.getOrderByIdAdmin
);
router.patch(
  "/admin/:id/status",
  authenticate,
  authorize("ADMIN"),
  orderController.updateOrderStatus
);
router.post(
  "/admin/:id/confirm",
  authenticate,
  authorize("ADMIN"),
  orderController.confirmOrder
);
router.post(
  "/admin/:id/reject",
  authenticate,
  authorize("ADMIN"),
  orderController.rejectOrder
);

export default router;