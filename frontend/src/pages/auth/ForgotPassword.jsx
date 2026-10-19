import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { forgotPassword } from "../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const result = await forgotPassword(email.trim());
      setMessage(result.message);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4faf6] px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[#e0ece5] bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f7ee] text-[#118961]">
          <Mail className="h-6 w-6" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#103b2d]">
          Forgot password?
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#718078]">
          Enter the email address associated with your MedCare account.
          If an active account matches, we will send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-[#253d34]"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="h-12 w-full rounded-xl border border-[#d9e5df] px-4 text-sm outline-none transition focus:border-[#48b78d] focus:ring-4 focus:ring-[#48b78d]/10"
            />
          </div>

          {message && (
            <div
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800"
            >
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#118961] px-4 text-sm font-semibold text-white transition hover:bg-[#0d7957] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Sending request..." : "Send reset link"}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-[#118961] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </section>
    </main>
  );
};

export default ForgotPassword;
