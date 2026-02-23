import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import homeRoutes from "./modules/home/home.router.js";
import authRoutes from "./modules/auth/auth.router.js";
import categoryRoutes from "./modules/categories/category.router.js";
import productRoutes from "./modules/products/product.router.js";
import cartRoutes from "./modules/cart/cart.router.js";
import orderRoutes from "./modules/orders/order.router.js";
import tableRoutes from "./modules/tables/table.router.js";
import userRoutes from "./modules/users/user.router.js";
import adminUserRoutes from "./modules/admin-users/admin-user.router.js";
import customizationRoutes from "./modules/customizations/customization.router.js";
import restaurantRoutes from "./modules/restaurant/restaurant.router.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/debug-env", (req, res) => {
  res.json({
    hasDbUrl: !!process.env.DATABASE_URL,
    hasDirectUrl: !!process.env.DIRECT_URL,
    hasCloudinary: !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/", homeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/customizations", customizationRoutes);
app.use("/api/restaurants", restaurantRoutes);

export default app;