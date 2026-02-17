// modules/auth/auth.service.js
import bcrypt from "bcrypt";
import prisma from "../../config/prisma.js";

const SALT_ROUNDS = 10;

/**
 * Sign up a new user
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password (plain text)
 * @returns {Promise<object>} User object without password
 * @throws {Error} If email already exists or validation fails
 */
export const signUp = async (name, email, password) => {
  // Validate input
  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  // Validate password length
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "CUSTOMER", // Default role
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

/**
 * Sign in an existing user
 * @param {string} email - User's email
 * @param {string} password - User's password (plain text)
 * @returns {Promise<object>} User object without password
 * @throws {Error} If credentials are invalid
 */
export const signIn = async (email, password) => {
  // Validate input
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if user has a password (for users created without password)
  if (!user.password) {
    throw new Error("Invalid email or password");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Return user without password
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};

/**
 * Sign out (no database operation needed, handled by clearing cookie)
 * This function exists for consistency in the service layer
 * @returns {Promise<object>} Success message
 */
export const signOut = async () => {
  // Token invalidation is handled client-side by clearing the cookie
  // In a more advanced implementation, you might want to maintain a token blacklist
  return { message: "Signed out successfully" };
};

