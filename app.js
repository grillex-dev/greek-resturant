import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import homeRoutes from "./modules/home/home.router.js";
import authRoutes from "./modules/auth/auth.router.js";

const app = express();

app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
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

export default app;