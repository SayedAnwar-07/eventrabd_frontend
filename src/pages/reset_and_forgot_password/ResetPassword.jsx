import React, { useState, useEffect, useMemo } from "react";
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

const ResetPassword = () => {
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enter the OTP and your new password
          </p>
        </div>

        {otpSentEmail && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                OTP sent to: <span className="font-bold">{otpSentEmail}</span>
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-100 mt-1">
              Please check your email for the 6-digit OTP code
            </p>
          </div>
        )}

        <div>
          {displayErrors.root && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                {displayErrors.root}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-gray-700 dark:text-gray-100 font-medium flex items-center justify-between"
              >
                <span>Email Address</span>
                {otpSentEmail && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700"
                  >
                    OTP Sent
                  </Badge>
                )}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`pl-10 h-12 dark:text-white ${displayErrors.email ? "border-red-300 focus:ring-red-200" : ""}`}
                  disabled={loading || !!otpSentEmail}
                  {...register("email")}
                />
              </div>
              {displayErrors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {displayErrors.email}
                </p>
              )}
            </div>

            {/* OTP Field */}
            <div className="space-y-2">
              <Label
                htmlFor="otp"
                className="text-gray-700 dark:text-gray-100 font-medium"
              >
                OTP Code
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className={`pl-10 h-12 ${displayErrors.otp ? "border-red-300 focus:ring-red-200" : ""}`}
                  maxLength={6}
                  disabled={loading}
                  {...register("otp")}
                />
              </div>
              {displayErrors.otp && (
                <p className="text-sm text-red-600 mt-1">{displayErrors.otp}</p>
              )}
              <div className="flex justify-between text-xs text-gray-500">
                <span className="dark:text-gray-300">
                  Check your email for OTP
                </span>
                <Link
                  to="/forgot-password"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800"
                >
                  Resend OTP
                </Link>
              </div>
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="new_password"
                className="text-gray-700 dark:text-gray-100 font-medium"
              >
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="new_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className={`pl-10 pr-10 h-12 ${displayErrors.new_password ? "border-red-300 focus:ring-red-200" : ""}`}
                  disabled={loading}
                  {...register("new_password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
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
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Password Strength</span>
                    <span className={`font-medium ${strengthTextColor}`}>
                      {strengthText}
                    </span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthColor}`}
                      style={{ width: `${Math.min(passwordStrength, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {displayErrors.new_password ? (
                <p className="text-sm text-red-600 mt-1">
                  {displayErrors.new_password}
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  Must be at least 8 chars with uppercase, lowercase, number, &
                  special char
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="confirm_password"
                className="text-gray-700 dark:text-gray-100 font-medium"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className={`pl-10 pr-10 h-12 ${displayErrors.confirm_password ? "border-red-300 focus:ring-red-200" : ""}`}
                  disabled={loading}
                  {...register("confirm_password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {displayErrors.confirm_password && (
                <p className="text-sm text-red-600 mt-1">
                  {displayErrors.confirm_password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="gradient-button w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Resetting
                  Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
