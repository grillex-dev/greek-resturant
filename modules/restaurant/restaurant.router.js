// modules/restaurant/restaurant.router.js
import { Router } from "express";
import * as restaurantController from "./restaurant.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";

const router = Router();

// Public routes
router.get("/:id/public", restaurantController.getRestaurantPublicInfo);
router.get("/:id", restaurantController.getRestaurantById);

// Protected admin routes
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  restaurantController.createRestaurant
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  restaurantController.updateRestaurant
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  restaurantController.deleteRestaurant
);

export default router;
