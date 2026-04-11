// modules/orders/order.router.js
import { Router } from "express";
import * as orderController from "./order.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { attachSession } from "../middlewares/session.middleware.js";
 
const router = Router();
 
// ====================== PUBLIC / GUEST ROUTES ======================
 
// attachSession ensures req.sessionId is always set for order creation,
// whether the user is a guest or authenticated.
// authenticate is NOT applied here so guests are not blocked.
router.post("/", attachSession, orderController.createOrder);
 
// Authenticated customer routes — session is also attached so the controller
// can see both identifiers if needed (e.g. merging guest history on login)
router.get("/", attachSession, authenticate, orderController.getUserOrders);
router.get("/:id", attachSession, authenticate, orderController.getOrderById);
 
// ====================== ADMIN ROUTES ======================
// Admins operate server-side; no session cookie needed for their queries.
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