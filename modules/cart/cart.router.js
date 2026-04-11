import { Router } from "express";
import * as cartController from "./cart.controller.js";
import { attachSession } from "../middlewares/session.middleware.js";

const router = Router();
router.use(attachSession);

// Cart routes
router.get("/", cartController.getCart);
router.get("/totals", cartController.getCartTotals);
router.post("/", cartController.addToCart);
router.put("/:id", cartController.updateCartItemQuantity);
router.delete("/:id", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

export default router;
