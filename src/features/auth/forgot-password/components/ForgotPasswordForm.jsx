"use client";

import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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

const ForgotPasswordForm = () => {
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
    <section className="flex min-h-screen items-center justify-center bg-background py-10 text-foreground">
      <div className="w-full max-w-md">
        <div className="border border-border bg-card px-6 py-8 shadow-sm sm:px-8">
          <div className="mb-7 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Password Help
            </p>

            <h1 className="text-2xl font-bold tracking-tight">
              Forgot password
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Enter your email to receive a password reset OTP.
            </p>
          </div>

          {showSuccess && (
            <div className="mb-6 space-y-4">
              <Alert className="border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/30">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertDescription className="font-medium text-green-700 dark:text-green-400">
                  OTP has been sent to your email.
                </AlertDescription>
              </Alert>

              <div className="border border-border bg-muted/30 px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  Email sent to:
                </p>

                <p className="mt-1 break-all text-sm text-muted-foreground">
                  {emailSent}
                </p>

                <p className="mt-3 text-sm text-muted-foreground">
                  Redirecting to reset password page in 2 seconds...
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                onClick={() =>
                  navigate(
                    `/reset-password?email=${encodeURIComponent(emailSent)}`,
                  )
                }
              >
                Go to Reset Password Now
              </Button>

              <button
                type="button"
                onClick={handleResendOTP}
                className="w-full text-center text-sm font-medium text-primary hover:underline"
              >
                Did not receive OTP? Resend
              </button>
            </div>
          )}

          {displayErrors.root && (
            <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30">
              <AlertDescription className="text-sm font-medium text-red-700 dark:text-red-400">
                {displayErrors.root}
              </AlertDescription>
            </Alert>
          )}

          {!showSuccess && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`h-11 pl-10 ${
                      displayErrors.email ? "border-red-400" : ""
                    }`}
                    disabled={loading}
                    readOnly={!!user}
                    {...register("email")}
                  />
                </div>

                <p className="min-h-4 text-xs font-medium text-red-500">
                  {displayErrors.email}
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
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          )}

          {!showSuccess && (
            <div className="mt-7 border-t border-border pt-5">
              <p className="text-center text-sm leading-6 text-muted-foreground">
                You will receive a 6-digit OTP code by email. This code expires
                in 10 minutes.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordForm;
