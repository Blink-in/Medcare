import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";

import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm({
  className,
  formData,
  handleChange,
  handleSubmit,
  error,
  isLoading,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [showPatientDetails, setShowPatientDetails] =
    useState(false);

  return (
    <div
      className={cn("w-full", className)}
      {...props}
    >
      <div className="mb-7">
        <h2 className="text-[34px] font-bold leading-tight tracking-[-0.025em] text-[#103b2d] sm:text-[38px]">
          Create your account
        </h2>

        <p className="mt-3 max-w-[430px] text-[14px] leading-6 text-[#718078]">
          Join MedCare to access healthcare services,
          manage your information, and stay connected
          with your care team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-[13px] font-semibold text-[#253d34]"
            >
              First name
            </Label>

            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              autoComplete="given-name"
              required
              className="h-[50px] rounded-xl border-[#d9e5df] bg-white px-4 text-[14px] shadow-sm placeholder:text-[#9eaaa5] focus-visible:border-[#48b78d] focus-visible:ring-4 focus-visible:ring-[#48b78d]/10"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="text-[13px] font-semibold text-[#253d34]"
            >
              Last name
            </Label>

            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              autoComplete="family-name"
              required
              className="h-[50px] rounded-xl border-[#d9e5df] bg-white px-4 text-[14px] shadow-sm placeholder:text-[#9eaaa5] focus-visible:border-[#48b78d] focus-visible:ring-4 focus-visible:ring-[#48b78d]/10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
              htmlFor="phone"
              className="text-[13px] font-semibold text-[#253d34]"
            >
              Phone number{" "}
              <span className="font-normal text-[#9eaaa5]">
                (optional)
              </span>
            </Label>

            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="08012345678"
              autoComplete="tel"
              className="h-[50px] rounded-xl border-[#d9e5df] bg-white px-4 text-[14px] shadow-sm placeholder:text-[#9eaaa5] focus-visible:border-[#48b78d] focus-visible:ring-4 focus-visible:ring-[#48b78d]/10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                placeholder="Create a password"
                autoComplete="new-password"
                required
                className="h-[50px] rounded-xl border-[#d9e5df] bg-white px-4 pr-11 text-[14px] shadow-sm placeholder:text-[#9eaaa5] focus-visible:border-[#48b78d] focus-visible:ring-4 focus-visible:ring-[#48b78d]/10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
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

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-[13px] font-semibold text-[#253d34]"
            >
              Confirm password
            </Label>

            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showConfirmPassword ? "text" : "password"
                }
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
                className="h-[50px] rounded-xl border-[#d9e5df] bg-white px-4 pr-11 text-[14px] shadow-sm placeholder:text-[#9eaaa5] focus-visible:border-[#48b78d] focus-visible:ring-4 focus-visible:ring-[#48b78d]/10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c8c84] transition-colors hover:text-[#118961]"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-[17px] w-[17px]" />
                ) : (
                  <Eye className="h-[17px] w-[17px]" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#d9e5df] bg-[#f7fbf9] p-4">
          <button
            type="button"
            onClick={() =>
              setShowPatientDetails(!showPatientDetails)
            }
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <p className="text-[13px] font-semibold text-[#253d34]">
                Patient information
              </p>

              <p className="mt-1 text-[12px] leading-5 text-[#8a9791]">
                Optional. You can add or update these details
                later.
              </p>
            </div>

            <ChevronDown
              className={cn(
                "h-4 w-4 text-[#118961] transition-transform",
                showPatientDetails && "rotate-180"
              )}
            />
          </button>

          {showPatientDetails && (
            <div className="mt-5 space-y-5 border-t border-[#dfe8e3] pt-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="dateOfBirth"
                    className="text-[13px] font-semibold text-[#253d34]"
                  >
                    Date of birth
                  </Label>

                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="h-[50px] rounded-xl border-[#d9e5df] bg-white px-4 text-[14px] shadow-sm focus-visible:border-[#48b78d] focus-visible:ring-4 focus-visible:ring-[#48b78d]/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="gender"
                    className="text-[13px] font-semibold text-[#253d34]"
                  >
                    Gender
                  </Label>

                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="h-[50px] w-full rounded-xl border border-[#d9e5df] bg-white px-4 text-[14px] text-[#253d34] shadow-sm outline-none transition focus:border-[#48b78d] focus:ring-4 focus:ring-[#48b78d]/10"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="bloodType"
                  className="text-[13px] font-semibold text-[#253d34]"
                >
                  Blood type
                </Label>

                <select
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="h-[50px] w-full rounded-xl border border-[#d9e5df] bg-white px-4 text-[14px] text-[#253d34] shadow-sm outline-none transition focus:border-[#48b78d] focus:ring-4 focus:ring-[#48b78d]/10"
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-[13px] font-semibold text-[#253d34]"
                >
                  Address
                </Label>

                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  autoComplete="street-address"
                  className="h-[50px] rounded-xl border-[#d9e5df] bg-white px-4 text-[14px] shadow-sm placeholder:text-[#9eaaa5] focus-visible:border-[#48b78d] focus-visible:ring-4 focus-visible:ring-[#48b78d]/10"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="allergies"
                  className="text-[13px] font-semibold text-[#253d34]"
                >
                  Allergies{" "}
                  <span className="font-normal text-[#9eaaa5]">
                    (optional)
                  </span>
                </Label>

                <Input
                  id="allergies"
                  name="allergies"
                  type="text"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="e.g. Penicillin, peanuts"
                  className="h-[50px] rounded-xl border-[#d9e5df] bg-white px-4 text-[14px] shadow-sm placeholder:text-[#9eaaa5] focus-visible:border-[#48b78d] focus-visible:ring-4 focus-visible:ring-[#48b78d]/10"
                />

                <p className="text-[11px] text-[#8a9791]">
                  Separate multiple allergies with commas.
                </p>
              </div>

              <div>
                <p className="mb-3 text-[13px] font-semibold text-[#253d34]">
                  Emergency contact
                </p>

                <div className="space-y-4">
                  <Input
                    name="emergencyContactName"
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    placeholder="Contact name"
                    className="h-[50px] rounded-xl border-[#d9e5df] bg-white px-4 text-[14px] shadow-sm placeholder:text-[#9eaaa5] focus-visible:border-[#48b78d] focus-visible:ring-4 focus-visible:ring-[#48b78d]/10"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="emergencyContactRelationship"
                      type="text"
                      value={
                        formData.emergencyContactRelationship
                      }
                      onChange={handleChange}
                      placeholder="Relationship"
                      className="h-[50px] rounded-xl border-[#d9e5df] bg-white px-4 text-[14px] shadow-sm placeholder:text-[#9eaaa5] focus-visible:border-[#48b78d] focus-visible:ring-4 focus-visible:ring-[#48b78d]/10"
                    />

                    <Input
                      name="emergencyContactPhone"
                      type="tel"
                      value={
                        formData.emergencyContactPhone
                      }
                      onChange={handleChange}
                      placeholder="Phone number"
                      className="h-[50px] rounded-xl border-[#d9e5df] bg-white px-4 text-[14px] shadow-sm placeholder:text-[#9eaaa5] focus-visible:border-[#48b78d] focus-visible:ring-4 focus-visible:ring-[#48b78d]/10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
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
            "Creating account..."
          ) : (
            <span className="flex items-center justify-center gap-2">
              Create account
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#dfe8e3]" />

        <span className="text-[11px] text-[#8a9791]">
          Already a MedCare user?
        </span>

        <div className="h-px flex-1 bg-[#dfe8e3]" />
      </div>

      <p className="text-center text-[13px] text-[#7a8781]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#118961] underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}