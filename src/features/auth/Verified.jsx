"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

import {
  clearError,
  clearSuccess,
  verifyOtp,
} from "@/store/features/auth/authSlice";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const { loading, error, success } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState("");

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      navigate("/login", { replace: true });
    }
  }, [success, navigate]);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      dispatch(clearError());
    }, 5000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  const getErrorMessage = () => {
    if (!error) return "";

    if (typeof error === "string") return error;

    return (
      error.detail ||
      error.non_field_errors?.[0] ||
      error.message ||
      Object.values(error).flat()?.[0] ||
      "OTP verification failed."
    );
  };

  const handleVerify = (event) => {
    event.preventDefault();

    if (!email || otp.length !== 6 || loading) return;

    dispatch(
      verifyOtp({
        email,
        otp,
      }),
    );
  };

  if (!email) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
        <div className="w-full max-w-md border border-border bg-card px-6 py-8 text-center shadow-sm sm:px-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Verification
          </p>

          <h1 className="text-2xl font-bold tracking-tight">Email missing</h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Please register again to receive a new OTP verification code.
          </p>

          <Link
            to="/register"
            className="mt-6 inline-flex h-11 items-center justify-center bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Go to Register
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-background py-10 text-foreground">
      <div className="w-full max-w-md">
        <div className="border border-border bg-card px-6 py-8 shadow-sm sm:px-8">
          <div className="mb-7 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Email Verification
            </p>

            <h1 className="text-2xl font-bold tracking-tight">
              Verify your email
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Enter the 6-digit OTP sent to
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-foreground">
              {email}
            </p>
          </div>

          {error && (
            <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
              {getErrorMessage()}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-3">
              <Label className="block text-center">Enter OTP</Label>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                The OTP must contain 6 digits.
              </p>
            </div>

            <Button
              type="submit"
              className="h-11 w-full gradient-button font-semibold"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </form>

          <div className="mt-7 border-t border-border pt-5">
            <p className="text-center text-sm text-muted-foreground">
              Wrong email?{" "}
              <Link to="/register" className="font-semibold text-primary">
                Register again
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyOtp;
