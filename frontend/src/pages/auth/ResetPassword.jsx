
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { resetPassword } from "../../services/authService";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is invalid or has expired. Request a new one.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ token, password, confirmPassword });
      navigate("/login", {
        replace: true,
        state: {
          message: "Password reset successfully. Please log in with your new password.",
        },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to reset your password. Please request a new reset link."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4faf6] px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[#e0ece5] bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f7ee] text-[#118961]">
          <LockKeyhole className="h-6 w-6" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#103b2d]">
          Create a new password
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#718078]">
          Choose a new password for your MedCare account. Your password must
          contain at least 6 characters.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-[#253d34]"
            >
              New password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
                className="h-12 w-full rounded-xl border border-[#d9e5df] px-4 pr-12 text-sm outline-none transition focus:border-[#48b78d] focus:ring-4 focus:ring-[#48b78d]/10"
                placeholder="At least 6 characters"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#718078]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-[#253d34]"
            >
              Confirm new password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="h-12 w-full rounded-xl border border-[#d9e5df] px-4 pr-12 text-sm outline-none transition focus:border-[#48b78d] focus:ring-4 focus:ring-[#48b78d]/10"
                placeholder="Enter the password again"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#718078]"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-[#118961] px-4 text-sm font-semibold text-white transition hover:bg-[#0d7957] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Resetting password..." : "Reset password"}
          </button>
        </form>

        <Link
          to="/forgot-password"
          className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-[#118961] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Request another reset link
        </Link>
      </section>
    </main>
  );
};

export default ResetPassword;
