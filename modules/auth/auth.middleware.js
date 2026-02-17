// modules/auth/auth.middleware.js
import { verifyToken } from "../../utils/jwt.js";
import prisma from "../../config/prisma.js";

const COOKIE_NAME = "auth_token";

/**
 * Middleware to authenticate requests using JWT token from cookie
 * Attaches user object to req.user if authentication succeeds
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please sign in.",
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      // Invalid or expired token - clear the cookie
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please sign in again.",
      });
    }

    // Fetch user from database to ensure user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      // User no longer exists - clear the cookie
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(401).json({
        success: false,
        message: "User not found. Please sign in again.",
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};

/**
 * Optional middleware to check if user has a specific role
 * Use after authenticate middleware
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

