// modules/auth/auth.controller.js
import * as authService from "./auth.service.js";
import { generateToken } from "../../utils/jwt.js";

const COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  httpOnly: true, // Prevents XSS attacks
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict", // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

/**
 * Sign up a new user
 * POST /api/auth/signup
 */
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Call service to create user
    const user = await authService.signUp(name, email, password);

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    // Set HTTP-only cookie with token
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    // Return success response
    return res.status(201).json({
      success: true,
      message: "User signed up successfully",
      user,
    });
  } catch (error) {
    // Handle specific errors
    if (error.message === "Email already exists") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Invalid email format" ||
      error.message === "Password must be at least 6 characters long" ||
      error.message === "Name, email, and password are required"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Generic server error
    console.error("Sign up error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Sign in an existing user
 * POST /api/auth/signin
 */
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Call service to verify credentials
    const user = await authService.signIn(email, password);

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    // Set HTTP-only cookie with token
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "User signed in successfully",
      user,
    });
  } catch (error) {
    // Handle invalid credentials
    if (error.message === "Invalid email or password") {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    // Handle validation errors
    if (error.message === "Email and password are required") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Generic server error
    console.error("Sign in error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Sign out a user
 * POST /api/auth/signout
 */
export const signOut = async (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: "User signed out successfully",
    });
  } catch (error) {
    console.error("Sign out error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

