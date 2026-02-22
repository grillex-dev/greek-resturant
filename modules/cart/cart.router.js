// modules/cart/cart.router.js
import { Router } from "express";
import * as cartController from "./cart.controller.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// Cart routes
router.get("/", cartController.getCart);
router.get("/totals", cartController.getCartTotals);
router.post("/", cartController.addToCart);
router.put("/:id", cartController.updateCartItemQuantity);
router.delete("/:id", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

export default router;
