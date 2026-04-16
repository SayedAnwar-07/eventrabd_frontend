"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { clearError, verifyOtp } from "@/store/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const VerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const { loading, error, success } = useSelector((state) => state.auth);
  console.log(error);

  const [otp, setOtp] = useState("");

  const handleVerify = (e) => {
    e.preventDefault();
    dispatch(verifyOtp({ email, otp }));
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Email missing. Please register again!</p>
      </div>
    );
  }

  if (success) {
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background text-foreground">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Verify Your Email
        </h1>

        {error && (
          <p className="text-red-500 text-center mb-4">
            {error.detail ||
              error.non_field_errors?.[0] ||
              error.message ||
              JSON.stringify(error)}
          </p>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <Label>Enter OTP</Label>
            <Input
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <Button className="w-full gradient-button" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
