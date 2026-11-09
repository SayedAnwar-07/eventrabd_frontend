"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import { Loader2, Eye, EyeOff, X, ArrowLeft } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import {
  registerUser,
  clearSuccess,
  clearError,
} from "@/store/features/auth/authSlice";

import { useForm } from "react-hook-form";
import { sellerRegisterSchema } from "@/validation/registerSchema";
import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

// ============================================
// UI STYLES
// ============================================

const fieldClass =
  "h-11 w-full rounded-md border border-[#E5DDD5] bg-gray-50 px-3 text-sm text-[#3D3530] shadow-none transition-colors placeholder:text-[#A69B91] focus-visible:border-[#A68C78] focus-visible:ring-2 focus-visible:ring-[#A68C78]/20";

const labelClass = "mb-1.5 block text-xs font-medium text-[#51463E]";

const errorClass =
  "mt-1.5 min-h-4 text-xs font-medium leading-relaxed text-red-600";

const phoneWrapperClass =
  "flex h-11 overflow-hidden rounded-md border border-[#E5DDD5] bg-gray-50 transition-colors focus-within:border-[#A68C78] focus-within:ring-2 focus-within:ring-[#A68C78]/20";

const passwordToggleClass =
  "absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#9B9087] transition-colors hover:text-[#3D3530] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A68C78]/30";

// ============================================
// FORM COMPONENT
// ============================================

const SellerForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // State to hold manual Zod validation errors
  const [validationErrors, setValidationErrors] = useState({});

  const [dismissedError, setDismissedError] = useState(null);
  const errorKey = error ? JSON.stringify(error) : null;
  const errorVisible = !!errorKey && errorKey !== dismissedError;
  const handleDismissError = () => setDismissedError(errorKey);

  const { register, handleSubmit, setValue } = useForm({
    // resolver removed
    defaultValues: { role: "seller", terms_accept: false },
  });

  const onSubmit = (data) => {
    setValidationErrors({});

    const normalizedData = {
      ...data,
      contact_number: data.contact_number ? `+88${data.contact_number}` : "",
      whatsapp_number: data.whatsapp_number ? `+88${data.whatsapp_number}` : "",
    };

    const result = sellerRegisterSchema.safeParse(normalizedData);

    if (!result.success) {
      const formattedErrors = {};

      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0]] = issue.message;
      });

      setValidationErrors(formattedErrors);
      return;
    }

    setRegisteredEmail(result.data.email);

    dispatch(
      registerUser({
        ...result.data,
        role: "seller",
      }),
    );
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
    <section className="min-h-screen py-10 text-[#3D3530] sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-2xl">
        {/* ===================================
            BACK NAVIGATION
        =================================== */}

        <button
          type="button"
          onClick={() => navigate("/register")}
          className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-[#756A62] transition-colors hover:text-[#3D3530]"
        >
          <ArrowLeft className="h-4 w-4" />
          Choose a different role
        </button>

        {/* ===================================
            PAGE HEADER
        =================================== */}

        <div className="mb-7">
          <div className="mb-3 inline-flex items-center rounded-md border border-[#E5DDD5] bg-[#FFFCF9] px-3 py-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#756A62]">
              Seller Registration
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#3D3530] sm:text-3xl">
            Create Your Seller Account
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#756A62]">
            Join EventraBD and start showcasing your event services.
          </p>
        </div>

        {/* ===================================
            REGISTRATION CARD
        =================================== */}

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
              <input type="hidden" {...register("role")} value="seller" />

              {/* ===================================
                  FORM FIELDS
              =================================== */}

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

                {/* Contact Number */}

                <div className="min-w-0">
                  <Label htmlFor="contact-number" className={labelClass}>
                    Contact Number
                    <span className="ml-1 text-red-600">*</span>
                  </Label>

                  <div
                    className={`${phoneWrapperClass} ${
                      validationErrors.contact_number ? "border-red-500" : ""
                    }`}
                  >
                    <span className="flex shrink-0 items-center border-r border-[#E5DDD5] my-2 ml-3 pr-3 font-mono text-sm font-medium text-[#756A62]">
                      +88
                    </span>

                    <input
                      id="contact-number"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      {...register("contact_number", {
                        onChange: (event) => {
                          event.target.value = event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 11);
                        },
                      })}
                      className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#3D3530] outline-none placeholder:text-[#A69B91]"
                    />
                  </div>

                  {validationErrors.contact_number && (
                    <p className={errorClass}>
                      {validationErrors.contact_number}
                    </p>
                  )}
                </div>

                {/* WhatsApp Number */}

                <div className="min-w-0">
                  <Label htmlFor="whatsapp-number" className={labelClass}>
                    WhatsApp Number
                    <span className="ml-1 text-red-600">*</span>
                  </Label>

                  <div
                    className={`${phoneWrapperClass} ${
                      validationErrors.whatsapp_number ? "border-red-500" : ""
                    }`}
                  >
                    <span className="my-2 ml-3 flex shrink-0 items-center border-r border-[#E5DDD5] pr-3 font-mono text-sm font-medium text-[#756A62]">
                      +88
                    </span>

                    <input
                      id="whatsapp-number"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      {...register("whatsapp_number", {
                        onChange: (event) => {
                          event.target.value = event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 11);
                        },
                      })}
                      className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#3D3530] outline-none placeholder:text-[#A69B91]"
                    />
                  </div>

                  {validationErrors.whatsapp_number && (
                    <p className={errorClass}>
                      {validationErrors.whatsapp_number}
                    </p>
                  )}
                </div>

                {/* Bio */}

                <div className="min-w-0 sm:col-span-2">
                  <Label className={labelClass}>
                    Bio
                    <span className="ml-1 text-[11px] font-normal text-[#9B9087]">
                      (Optional)
                    </span>
                  </Label>

                  <Textarea
                    placeholder="Tell us a little about yourself and your experience..."
                    {...register("bio")}
                    rows={4}
                    className={`min-h-28 w-full resize-none rounded-md border border-[#E5DDD5] bg-gray-50 px-3 py-3 text-sm leading-relaxed text-[#3D3530] shadow-none transition-colors placeholder:text-[#A69B91] focus-visible:border-[#A68C78] focus-visible:ring-2 focus-visible:ring-[#A68C78]/20 ${
                      validationErrors.bio ? "border-red-500" : ""
                    }`}
                  />

                  {validationErrors.bio && (
                    <p className={errorClass}>{validationErrors.bio}</p>
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
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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

                {/* Confirm Password */}

                <div className="min-w-0 sm:col-span-2">
                  <Label className={labelClass}>
                    Confirm Password
                    <span className="ml-1 text-red-600">*</span>
                  </Label>

                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...register("confirm_password")}
                      className={`${fieldClass} pr-11 ${
                        validationErrors.confirm_password
                          ? "border-red-500"
                          : ""
                      }`}
                    />

                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className={passwordToggleClass}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {validationErrors.confirm_password && (
                    <p className={errorClass}>
                      {validationErrors.confirm_password}
                    </p>
                  )}
                </div>
              </div>

              {/* ===================================
                  TERMS & CONDITIONS
              =================================== */}

              <div className="border-t border-[#F0EAE4] pt-5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms-seller"
                    onCheckedChange={(v) => setValue("terms_accept", v)}
                    className="mt-0.5 h-4 w-4 rounded border-[#CFC2B6] data-[state=checked]:border-[#3D3530] data-[state=checked]:bg-[#3D3530] data-[state=checked]:text-white"
                  />

                  <Label
                    htmlFor="terms-seller"
                    className="cursor-pointer text-xs font-medium leading-relaxed text-[#51463E] sm:text-sm"
                  >
                    I accept the Terms & Conditions
                  </Label>
                </div>

                {validationErrors.terms_accept && (
                  <p className={errorClass}>{validationErrors.terms_accept}</p>
                )}
              </div>

              {/* ===================================
                  SUBMIT BUTTON
              =================================== */}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-md border border-[#3D3530] bg-[#3D3530] px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:border-[#51463E] hover:bg-[#51463E] focus-visible:ring-2 focus-visible:ring-[#A68C78]/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Register as Seller"
                )}
              </Button>

              {/* ===================================
                  LOGIN LINK
              =================================== */}

              <div className="border-t border-[#F0EAE4] pt-5">
                <p className="text-center text-xs leading-relaxed text-[#756A62] sm:text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-[#3D3530] underline-offset-4 transition-colors hover:text-[#A68C78] hover:underline"
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

export default SellerForm;
