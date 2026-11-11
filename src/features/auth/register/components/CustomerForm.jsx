"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Eye, EyeOff, X, ArrowLeft } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import {
  registerUser,
  clearSuccess,
  clearError,
} from "@/store/features/auth/authSlice";

import { useForm } from "react-hook-form";
import { customerRegisterSchema } from "@/validation/registerSchema";
import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";
import SEO from "@/components/seo/SEO";

// ============================================
// EVENTRABD UI STYLES
// ============================================

const fieldClass =
  "h-11 w-full rounded-md border border-[#E5DDD5] bg-gray-50 px-3 text-sm text-theme-color shadow-none transition-colors placeholder:text-[#A69B91] focus-visible:border-[#A68C78] focus-visible:ring-2 focus-visible:ring-[#A68C78]/20";

const labelClass = "mb-1.5 block text-xs font-medium text-[#51463E]";

const errorClass = "mt-1.5 text-xs font-medium leading-relaxed text-red-600";

const passwordToggleClass =
  "absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#9B9087] transition-colors hover:text-theme-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A68C78]/30";

// ============================================
// CUSTOMER REGISTRATION COMPONENT
// ============================================

const CustomerForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [dismissedError, setDismissedError] = useState(null);
  const errorKey = error ? JSON.stringify(error) : null;
  const errorVisible = !!errorKey && errorKey !== dismissedError;
  const handleDismissError = () => setDismissedError(errorKey);

  const [validationErrors, setValidationErrors] = useState({});

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: { role: "customer", terms_accept: false },
  });

  const onSubmit = (data) => {
    setValidationErrors({});

    const result = customerRegisterSchema.safeParse(data);

    if (!result.success) {
      const formattedErrors = result.error.format();
      const errorMap = {};

      Object.keys(formattedErrors).forEach((key) => {
        if (formattedErrors[key]?._errors) {
          errorMap[key] = formattedErrors[key]._errors[0];
        }
      });

      setValidationErrors(errorMap);
      return;
    }

    setRegisteredEmail(data.email);
    dispatch(registerUser({ ...data, role: "customer" }));
  };

  useEffect(() => {
    if (success && registeredEmail) {
      navigate("/verify-otp", { state: { email: registeredEmail } });
      dispatch(clearSuccess());
    }
  }, [success, registeredEmail, navigate, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <section className="min-h-screen py-10 text-theme-color sm:px-6 sm:py-14">

      {/* SEO content */}
      <SEO
        title="Create a Customer Account"
        description="Create your EventraBD customer account to discover professional event services, explore service providers, connect with sellers, and find the right solutions for your next event."
        noIndex={true}
      />

      <div className="mx-auto w-full max-w-2xl">
        {/* Back Navigation */}

        <button
          type="button"
          onClick={() => navigate("/register")}
          className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-[#756A62] transition-colors hover:text-theme-color"
        >
          <ArrowLeft className="h-4 w-4" />
          Choose a different role
        </button>

        {/* Page Header */}

        <div className="mb-7">
          <div className="mb-3 inline-flex items-center rounded-md border border-[#E5DDD5] bg-[#FFFCF9] px-3 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#756A62]">
              Customer Registration
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-theme-color sm:text-3xl">
            Create Your Customer Account
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#756A62]">
            Join EventraBD to discover and book professional event services.
          </p>
        </div>

        {/* Registration Card */}

        <div className="overflow-hidden rounded-md border border-[#E5DDD5] bg-white shadow-[0_1px_2px_rgba(61,53,48,0.04),0_8px_24px_-12px_rgba(61,53,48,0.10)]">
          {/* Card Body */}

          <div className="p-4 sm:p-6">
            {/* Global Error */}

            {errorVisible && (
              <div className="relative mb-6">
                <GlobalErrorMessage error={error} />

                <button
                  type="button"
                  onClick={handleDismissError}
                  aria-label="Dismiss error"
                  className="absolute right-3 top-3 rounded-md text-red-600 transition-colors hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <input type="hidden" {...register("role")} value="customer" />

              {/* Form Fields */}

              <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6">
                {/* Full Name */}

                <div className="min-w-0 sm:col-span-2">
                  <Label className={labelClass}>
                    Full Name
                    <span className="ml-1 text-red-600">*</span>
                  </Label>

                  <Input
                    placeholder="Enter your full name"
                    {...register("full_name")}
                    className={`${fieldClass} ${
                      validationErrors.full_name ? "border-red-500" : ""
                    }`}
                  />

                  {validationErrors.full_name && (
                    <p className={errorClass}>{validationErrors.full_name}</p>
                  )}
                </div>

                {/* Email Address */}

                <div className="min-w-0 sm:col-span-2">
                  <Label className={labelClass}>
                    Email Address
                    <span className="ml-1 text-red-600">*</span>
                  </Label>

                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    {...register("email")}
                    className={`${fieldClass} ${
                      validationErrors.email ? "border-red-500" : ""
                    }`}
                  />

                  {validationErrors.email && (
                    <p className={errorClass}>{validationErrors.email}</p>
                  )}
                </div>

                {/* Password */}

                <div className="min-w-0 sm:col-span-2">
                  <Label className={labelClass}>
                    Password
                    <span className="ml-1 text-red-600">*</span>
                  </Label>

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                      className={`${fieldClass} pr-11 ${
                        validationErrors.password ? "border-red-500" : ""
                      }`}
                    />

                    <button
                      type="button"
                      className={passwordToggleClass}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {validationErrors.password && (
                    <p className={errorClass}>{validationErrors.password}</p>
                  )}
                </div>
              </div>

              {/* Terms & Conditions */}

              <div className="border-t border-[#F0EAE4] pt-5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms-customer"
                    onCheckedChange={(v) => setValue("terms_accept", v)}
                    className="mt-0.5 h-4 w-4 rounded border-[#CFC2B6] data-[state=checked]:border-theme-color data-[state=checked]:bg-theme-color data-[state=checked]:text-white"
                  />

                  <Label
                    htmlFor="terms-customer"
                    className="cursor-pointer text-xs font-medium leading-relaxed text-[#51463E] sm:text-sm"
                  >
                    I accept the Terms & Conditions
                  </Label>
                </div>

                {validationErrors.terms_accept && (
                  <p className={errorClass}>{validationErrors.terms_accept}</p>
                )}
              </div>

              {/* Submit Button */}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-md border border-theme-color bg-theme-color px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:border-[#51463E] hover:bg-[#51463E] focus-visible:ring-2 focus-visible:ring-[#A68C78]/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Register as Customer"
                )}
              </Button>

              {/* Login Link */}

              <div className="border-t border-[#F0EAE4] pt-5">
                <p className="text-center text-xs leading-relaxed text-[#756A62] sm:text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-theme-color underline-offset-4 transition-colors hover:text-[#A68C78] hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerForm;
