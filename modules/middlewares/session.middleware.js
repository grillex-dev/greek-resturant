// modules/auth/session.middleware.js
import { v4 as uuidv4 } from "uuid";

const SESSION_COOKIE_NAME = "session_id";

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,                                        // JS cannot read it — prevents XSS theft
  secure: process.env.NODE_ENV === "production",         // HTTPS only in production
  sameSite: "strict",                                    // CSRF protection
  maxAge: 30 * 24 * 60 * 60 * 1000,                     // 30 days — survives the whole shopping journey
};

/**
 * Session middleware — runs on every cart and order route.
 *
 * For authenticated users:  req.userId is already set by authenticate(),
 *                           we still attach req.sessionId so the cart merge
 *                           logic (guest → user) has both identifiers available.
 *
 * For guests:               No auth cookie exists, so we read or generate a
 *                           session_id cookie and attach it to req.sessionId.
 *
 * Downstream services always receive { userId, sessionId } and decide which
 * one to use as the cart/order identifier.
 */
export const attachSession = (req, res, next) => {
  let sessionId = req.cookies?.[SESSION_COOKIE_NAME];

  if (!sessionId) {
    // First visit — generate a new UUID and write it as a cookie
    sessionId = uuidv4();
    res.cookie(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS);
  }

  req.sessionId = sessionId;
  next();
};