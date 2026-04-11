// modules/cart/cart.router.js
import { Router } from "express";
import * as cartController from "./cart.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { attachSession } from "../middlewares/session.middleware.js";

router.use(attachSession);
const router = Router();


// Cart routes
router.get("/", cartController.getCart);
router.get("/totals", cartController.getCartTotals);
router.post("/", cartController.addToCart);
router.put("/:id", cartController.updateCartItemQuantity);
router.delete("/:id", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

// export default router;
// // modules/cart/cart.router.js
// import { Router } from "express";
// import * as cartController from "./cart.controller.js";
// import { authenticate } from "../auth/auth.middleware.js";
 
// const router = Router();
 
// // attachSession runs on every cart route:
// //   - Reads the session_id cookie (or creates one for first-time guests)
// //   - Sets req.sessionId so controllers always have it alongside req.userId
// // authenticate is optional — it sets req.userId when the user is logged in
// // but does NOT block the request if no auth cookie is present.