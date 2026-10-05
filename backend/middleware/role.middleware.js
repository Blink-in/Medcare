export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Make sure authentication ran first
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check whether user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }

    // User has the required role
    next();
  };
};