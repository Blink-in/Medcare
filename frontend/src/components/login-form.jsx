import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  formData,
  handleChange,
  handleSubmit,
  error,
  isLoading,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className={cn("w-full", className)}
      {...props}
    >
      <div className="mb-9">
        <h2 className="text-[34px] font-bold leading-tight tracking-[-0.025em] text-[#103b2d] sm:text-[38px]">
          Welcome back
        </h2>

        <p className="mt-3 max-w-[390px] text-[14px] leading-6 text-[#718078]">
          Sign in to your MedCare account to continue
          managing healthcare services and patient
          information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-[13px] font-semibold text-[#253d34]"
          >
            Email address
          </Label>

          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="h-[50px] rounded-xl border-[#d9e5df] bg-white px-4 text-[14px] shadow-sm placeholder:text-[#9eaaa5] focus-visible:border-[#48b78d] focus-visible:ring-4 focus-visible:ring-[#48b78d]/10"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-[13px] font-semibold text-[#253d34]"
          >
            Password
          </Label>

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="h-[50px] rounded-xl border-[#d9e5df] bg-white px-4 pr-11 text-[14px] shadow-sm placeholder:text-[#9eaaa5] focus-visible:border-[#48b78d] focus-visible:ring-4 focus-visible:ring-[#48b78d]/10"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c8c84] transition-colors hover:text-[#118961]"
            >
              {showPassword ? (
                <EyeOff className="h-[17px] w-[17px]" />
              ) : (
                <Eye className="h-[17px] w-[17px]" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="h-[50px] w-full rounded-xl bg-[#118961] text-[14px] font-semibold text-white shadow-md shadow-[#118961]/15 transition-all hover:bg-[#0d7957] hover:shadow-lg"
        >
          {isLoading ? (
            "Signing in..."
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign in
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#dfe8e3]" />

        <span className="text-[11px] text-[#8a9791]">
          New to MedCare?
        </span>

        <div className="h-px flex-1 bg-[#dfe8e3]" />
      </div>

      <p className="text-center text-[13px] text-[#7a8781]">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-[#118961] underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}