const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Set authentication cookie
export const setAuthCookie = (res, token) => {
  res.cookie("token", token, authCookieOptions);
};

// Clear authentication cookie
export const clearAuthCookie = (res) => {
  const { maxAge, ...clearOptions } = authCookieOptions;

  res.clearCookie("token", clearOptions);
};
