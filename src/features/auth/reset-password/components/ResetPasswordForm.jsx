"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import {
  Mail,
  Key,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import {
  resetPassword,
  clearError,
  clearSuccess,
} from "@/store/features/auth/authSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const resetPasswordSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    otp: z.string().min(1, "OTP is required").length(6, "OTP must be 6 digits"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number, and special character",
      ),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

const ResetPasswordForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [manualErrors, setManualErrors] = useState({});

  const { loading, error, success } = useSelector((state) => state.auth);

  const { register, handleSubmit, setValue, control } = useForm({
    defaultValues: {
      email: "",
      otp: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const otpSentEmail = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get("email");
    return email ? decodeURIComponent(email) : "";
  }, [location.search]);

  useEffect(() => {
    if (otpSentEmail) {
      setValue("email", otpSentEmail);
    }
  }, [otpSentEmail, setValue]);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => navigate("/login"), 3000);

    return () => clearTimeout(timer);
  }, [success, navigate]);

  const backendErrors = useMemo(() => {
    if (!error) return {};
    if (typeof error === "string") return { root: error };

    return {
      ...(error.otp && { otp: error.otp }),
      ...(error.email && { email: error.email }),
      ...(error.confirm_password && {
        confirm_password: error.confirm_password,
      }),
      ...(error.detail && { root: error.detail }),
    };
  }, [error]);

  const displayErrors = { ...manualErrors, ...backendErrors };

  const newPassword = useWatch({
    control,
    name: "new_password",
    defaultValue: "",
  });

  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0;

    let strength = 0;

    if (newPassword.length >= 8) strength += 25;
    if (/[a-z]/.test(newPassword)) strength += 25;
    if (/[A-Z]/.test(newPassword)) strength += 25;
    if (/[0-9]/.test(newPassword)) strength += 15;
    if (/[@$!%*?&]/.test(newPassword)) strength += 10;

    return strength;
  }, [newPassword]);

  const strengthColor =
    passwordStrength >= 80
      ? "bg-green-500"
      : passwordStrength >= 60
        ? "bg-yellow-500"
        : passwordStrength >= 40
          ? "bg-orange-500"
          : "bg-red-500";

  const strengthText =
    passwordStrength >= 80
      ? "Strong"
      : passwordStrength >= 60
        ? "Good"
        : passwordStrength >= 40
          ? "Fair"
          : "Weak";

  const strengthTextColor =
    passwordStrength >= 80
      ? "text-green-600"
      : passwordStrength >= 60
        ? "text-yellow-600"
        : passwordStrength >= 40
          ? "text-orange-600"
          : "text-red-600";

  const onSubmit = async (data) => {
    setManualErrors({});
    dispatch(clearError());

    const result = resetPasswordSchema.safeParse(data);

    if (!result.success) {
      const formattedErrors = {};

      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[issue.path.length - 1]] = issue.message;
      });

      setManualErrors(formattedErrors);
      return;
    }

    await dispatch(resetPassword(data));
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-background py-10 text-foreground">
      <div className="w-full max-w-md">
        <div className="border border-border bg-card px-6 py-8 shadow-sm sm:px-8">
          <div className="mb-7 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Account Security
            </p>

            <h1 className="text-2xl font-bold tracking-tight">
              Reset password
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Enter the OTP and create a new password.
            </p>
          </div>

          {otpSentEmail && (
            <div className="mb-6 border border-green-200 bg-green-50 px-4 py-3 text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-400">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="text-sm font-semibold">OTP sent to:</p>

                  <p className="mt-1 break-all text-sm font-medium">
                    {otpSentEmail}
                  </p>

                  <p className="mt-2 text-xs">
                    Please check your email for the 6-digit OTP code.
                  </p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/30">
              <AlertDescription className="text-sm font-medium text-green-700 dark:text-green-400">
                Password reset successful. Redirecting to login...
              </AlertDescription>
            </Alert>
          )}

          {displayErrors.root && (
            <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30">
              <AlertDescription className="text-sm font-medium text-red-700 dark:text-red-400">
                {displayErrors.root}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center justify-between"
              >
                <span>Email Address</span>

                {otpSentEmail && (
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-xs text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-400"
                  >
                    OTP Sent
                  </Badge>
                )}
              </Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`h-11 pl-10 ${
                    displayErrors.email ? "border-red-400" : ""
                  }`}
                  disabled={loading || !!otpSentEmail}
                  {...register("email")}
                />
              </div>

              <p className="min-h-4 text-xs font-medium text-red-500">
                {displayErrors.email}
              </p>
            </div>

            {/* OTP Field */}
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>

              <div className="relative">
                <Key className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className={`h-11 pl-10 ${
                    displayErrors.otp ? "border-red-400" : ""
                  }`}
                  maxLength={6}
                  disabled={loading}
                  {...register("otp")}
                />
              </div>

              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">
                  Check your email for OTP
                </span>

                <Link
                  to="/forgot-password"
                  className="font-medium text-primary hover:underline"
                >
                  Resend OTP
                </Link>
              </div>

              <p className="min-h-4 text-xs font-medium text-red-500">
                {displayErrors.otp}
              </p>
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="new_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className={`h-11 pl-10 pr-11 ${
                    displayErrors.new_password ? "border-red-400" : ""
                  }`}
                  disabled={loading}
                  {...register("new_password")}
                />

                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {newPassword && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Password Strength
                    </span>

                    <span className={`font-semibold ${strengthTextColor}`}>
                      {strengthText}
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden bg-muted">
                    <div
                      className={`h-full ${strengthColor}`}
                      style={{ width: `${Math.min(passwordStrength, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {displayErrors.new_password ? (
                <p className="min-h-4 text-xs font-medium text-red-500">
                  {displayErrors.new_password}
                </p>
              ) : (
                <p className="min-h-4 text-xs text-muted-foreground">
                  Must include uppercase, lowercase, number, and special
                  character.
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm Password</Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className={`h-11 pl-10 pr-11 ${
                    displayErrors.confirm_password ? "border-red-400" : ""
                  }`}
                  disabled={loading}
                  {...register("confirm_password")}
                />

                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <p className="min-h-4 text-xs font-medium text-red-500">
                {displayErrors.confirm_password}
              </p>
            </div>

            <Button
              type="submit"
              className="h-11 w-full gradient-button font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          <div className="mt-7 border-t border-border pt-5">
            <Link
              to="/login"
              className="mx-auto inline-flex items-center text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPasswordForm;
