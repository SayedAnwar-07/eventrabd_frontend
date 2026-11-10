"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { loginUser, clearError } from "@/store/features/auth/authSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  LockKeyhole,
} from "lucide-react";

// ============================================
// EVENTRABD FORM DESIGN SYSTEM
// ============================================

const fieldClass =
  "h-11 w-full rounded-md border border-[#E5DDD5] bg-gray-50 px-3 text-sm text-theme-color shadow-none transition-colors placeholder:text-[#A69B91] focus-visible:border-[#A68C78] focus-visible:ring-2 focus-visible:ring-[#A68C78]/20 disabled:cursor-not-allowed disabled:bg-[#F8F5F2] disabled:opacity-70";

const buttonClass =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-theme-color bg-theme-color px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:border-[#51463E] hover:bg-[#51463E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A68C78]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const toastStyle = {
  background: "#FFFFFF",
  color: "#3D3530",
  border: "1px solid #E5DDD5",
  borderRadius: "8px",
  padding: "14px 16px",
  fontSize: "13px",
  boxShadow: "0 8px 24px -12px rgba(61,53,48,0.20)",
};

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect after successful authentication.
  const requestedPath = location.state?.from;

  const from = requestedPath
    ? `${requestedPath.pathname}${requestedPath.search || ""}${
        requestedPath.hash || ""
      }`
    : "/";

  const safeFrom = from.startsWith("/") && !from.startsWith("//") ? from : "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(safeFrom, { replace: true });
    }
  }, [isAuthenticated, navigate, safeFrom]);

  // Clean up stale authentication errors.
  useEffect(() => {
    dispatch(clearError());

    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    dispatch(clearError());

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      toast.error("Please enter your email and password.", {
        id: "login-error",
        style: toastStyle,
      });
      return;
    }

    const toastId = toast.loading("Signing in...", {
      id: "login-submit",
      style: toastStyle,
    });

    try {
      const result = await dispatch(
        loginUser({
          email: normalizedEmail,
          password,
        }),
      );

      if (loginUser.fulfilled.match(result)) {
        toast.success("Welcome back! Login successful.", {
          id: toastId,
          duration: 4000,
          style: toastStyle,
        });

        // Authentication state triggers the existing
        // useEffect redirect.
        return;
      }

      const payload = result.payload;

      const errorMessage =
        typeof payload === "string"
          ? payload
          : payload?.message ||
            payload?.detail ||
            result.error?.message ||
            "Unable to sign in. Please check your credentials.";

      toast.error(errorMessage, {
        id: toastId,
        duration: 5000,
        style: toastStyle,
      });
    } catch (err) {
      toast.error(err?.message || "Something went wrong. Please try again.", {
        id: toastId,
        duration: 5000,
        style: toastStyle,
      });
    }
  };

  return (
    <section className="flex min-h-screen w-full justify-center py-12 text-theme-color">
      <div className="w-full max-w-110">
        {/* ===================================
            PAGE HEADING
        =================================== */}

        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-theme-color sm:text-[28px]">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#756A62]">
            Sign in to your EventraBD account to continue.
          </p>
        </div>

        {/* ===================================
            LOGIN FORM CARD
        =================================== */}

        <div className="overflow-hidden rounded-md border border-[#E5DDD5] bg-white shadow-[0_1px_2px_rgba(61,53,48,0.04),0_8px_24px_-12px_rgba(61,53,48,0.10)]">
          {/* Form */}

          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
            {/* ===================================
                EMAIL ADDRESS
            =================================== */}

            <div className="min-w-0">
              <Label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-medium text-[#51463E]"
              >
                Email Address
                <span className="ml-1 text-red-600">*</span>
              </Label>

              <div className="relative">
                <Mail
                  size={17}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9087]"
                />

                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loading}
                  className={`${fieldClass} pl-10`}
                />
              </div>
            </div>

            {/* ===================================
                PASSWORD
            =================================== */}

            <div className="min-w-0">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <Label
                  htmlFor="login-password"
                  className="text-xs font-medium text-[#51463E]"
                >
                  Password
                  <span className="ml-1 text-red-600">*</span>
                </Label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#756A62] transition-colors hover:text-theme-color hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9087]"
                />

                <Input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={loading}
                  className={`${fieldClass} pl-10 pr-11`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#9B9087] transition-colors hover:text-theme-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A68C78]/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* ===================================
                SUBMIT BUTTON
            =================================== */}

            <Button type="submit" disabled={loading} className={buttonClass}>
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={17} aria-hidden="true" />
                </>
              )}
            </Button>

            {/* ===================================
                REGISTER LINK
            =================================== */}

            <div className="border-t border-[#F0EAE4] pt-5">
              <p className="text-center text-xs leading-relaxed text-[#756A62] sm:text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-theme-color underline-offset-4 transition-colors hover:text-[#A68C78] hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
