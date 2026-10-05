
export const errorHandler = (err, req, res, next) => {
  console.error("Server error:", err);

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    message:
      statusCode === 500
        ? "Something went wrong. Please try again later."
        : err.message || "An error occurred",
  });
};

