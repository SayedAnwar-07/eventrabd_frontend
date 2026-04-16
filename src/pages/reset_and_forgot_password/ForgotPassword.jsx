import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import {
  forgotPassword,
  clearError,
  clearSuccess,
} from "@/store/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState("");
  const [manualErrors, setManualErrors] = useState({});

  const { loading, error, success, user } = useSelector((state) => state.auth);

  const defaultEmail = user?.email ?? "";

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: { email: defaultEmail },
  });

  useEffect(() => {
    if (user?.email) {
      setValue("email", user.email);
    }
  }, [user, setValue]);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  useEffect(() => {
    if (success && emailSent) {
      const timer = setTimeout(() => {
        setShowSuccess(true);
        navigate(`/reset-password?email=${encodeURIComponent(emailSent)}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, emailSent, navigate]);

  const backendErrors = useMemo(() => {
    if (!error) return {};
    if (error.email) return { email: error.email };
    if (error.detail) return { root: error.detail };
    return {};
  }, [error]);

  const displayErrors = { ...manualErrors, ...backendErrors };

  const onSubmit = async (data) => {
    setManualErrors({});
    dispatch(clearError());

    const email = user?.email ?? data.email;
    const result = forgotPasswordSchema.safeParse({ email });

    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setManualErrors(formattedErrors);
      return;
    }

    setEmailSent(email);
    await dispatch(forgotPassword({ email }));
  };

  const handleResendOTP = () => {
    if (emailSent) {
      dispatch(clearError());
      setShowSuccess(false);
      setManualErrors({});
      dispatch(forgotPassword({ email: emailSent }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enter your email to receive a password reset OTP
          </p>
        </div>

        <div className="rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          {showSuccess && (
            <div className="mb-6">
              <Alert className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <AlertDescription className="text-green-800 dark:text-green-300 font-medium">
                  OTP has been sent to your email!
                </AlertDescription>
              </Alert>
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-300 text-sm mb-2">
                  <span className="font-semibold">✓ Email sent to:</span>{" "}
                  {emailSent}
                </p>
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  Redirecting to reset password page in 2 seconds...
                </p>
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full dark:border-gray-600 dark:text-gray-200"
                  onClick={() =>
                    navigate(
                      `/reset-password?email=${encodeURIComponent(emailSent)}`,
                    )
                  }
                >
                  Go to Reset Password Now
                </Button>
              </div>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  Didn't receive OTP? Resend
                </button>
              </div>
            </div>
          )}

          {displayErrors.root && (
            <Alert className="mb-6 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800">
              <AlertDescription className="text-red-800 dark:text-red-300">
                {displayErrors.root}
              </AlertDescription>
            </Alert>
          )}

          {!showSuccess && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-700 dark:text-gray-200 font-medium"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-300" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`pl-10 h-12 dark:text-gray-100 dark:border-gray-600 ${
                      displayErrors.email
                        ? "border-red-300 dark:border-red-500"
                        : ""
                    }`}
                    disabled={loading}
                    readOnly={!!user}
                    {...register("email")}
                  />
                </div>
                {displayErrors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {displayErrors.email}
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
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>

              <div className="text-center pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          )}

          {!showSuccess && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                You will receive a 6-digit OTP code via email. This code expires
                in 10 minutes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
