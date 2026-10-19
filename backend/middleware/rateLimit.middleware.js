
import rateLimit from "express-rate-limit";

const createRateLimiter = ({
  windowMs,
  limit,
  message,
  skipSuccessfulRequests = false,
}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    message: {
      success: false,
      message,
    },
  });

export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message:
    "Too many failed login attempts. Please wait 15 minutes before trying again.",
});

export const signupLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message:
    "Too many signup attempts. Please try again in an hour.",
});

export const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message:
    "Too many password reset requests. Please try again in an hour.",
});

export const resetPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message:
    "Too many password reset attempts. Please wait 15 minutes before trying again.",
});
