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
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Email Missing</h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Please register again to receive a new OTP.
          </p>

          <Link
            to="/register"
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Go to Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Verify Your Email</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Enter the 6-digit OTP sent to
          </p>

          <p className="mt-1 break-all text-sm font-semibold text-foreground">
            {email}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
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
          </div>

          <Button
            type="submit"
            className="w-full gradient-button"
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

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Wrong email?{" "}
          <Link to="/register" className="font-semibold text-primary">
            Register again
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
