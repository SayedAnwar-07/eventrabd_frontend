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
    // 1. Clear previous errors
    setValidationErrors({});

    // 2. Manually validate using Zod
    const result = sellerRegisterSchema.safeParse(data);

    if (!result.success) {
      // 3. Map Zod errors to a flat object
      const formattedErrors = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setValidationErrors(formattedErrors);
      return;
    }

    // 4. Proceed if valid
    setRegisteredEmail(data.email);
    dispatch(registerUser({ ...data, role: "seller" }));
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
    <section className="flex min-h-screen items-center justify-center bg-background py-10 text-foreground">
      <div className="w-full max-w-2xl">
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Choose a different role
        </button>

        <div className="border border-border bg-card px-6 py-8 shadow-sm sm:px-8">
          <div className="mb-7">
            <div className="mb-4 inline-flex border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Registering as Seller
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              Create seller account
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Add your information to start listing event services.
            </p>
          </div>

          {errorVisible && (
            <div className="mb-5 flex items-start justify-between border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
              <div className="flex-1 text-sm font-medium">
                {error.detail || error.email || JSON.stringify(error)}
              </div>

              <button
                type="button"
                onClick={handleDismissError}
                className="ml-3 text-red-600 transition hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-5 border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-400">
              Registration successful! Redirecting…
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register("role")} value="seller" />

            <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Full Name"
                  {...register("full_name")}
                  className="h-11"
                />
                <p className="min-h-4 text-xs font-medium text-red-500">
                  {validationErrors.full_name}
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  {...register("email")}
                  className="h-11"
                />
                <p className="min-h-4 text-xs font-medium text-red-500">
                  {validationErrors.email}
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Service Area</Label>
                <Input
                  placeholder="Only city name"
                  {...register("service_area")}
                  className="h-11"
                />
                <p className="min-h-4 text-xs font-medium text-red-500">
                  {validationErrors.service_area}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input
                  placeholder="+8801XXXXXXXX"
                  {...register("contact_number")}
                  className="h-11"
                />
                <p className="min-h-4 text-xs font-medium text-red-500">
                  {validationErrors.contact_number}
                </p>
              </div>

              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input
                  placeholder="+8801XXXXXXXX"
                  {...register("whatsapp_number")}
                  className="h-11"
                />
                <p className="min-h-4 text-xs font-medium text-red-500">
                  {validationErrors.whatsapp_number}
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Bio (Optional)</Label>
                <Textarea
                  placeholder="Write something about yourself..."
                  {...register("bio")}
                  className="min-h-28 resize-none"
                  rows={4}
                />
                <p className="min-h-4 text-xs font-medium text-red-500">
                  {validationErrors.bio}
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Password</Label>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className="h-11 pr-11"
                  />

                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <p className="min-h-4 text-xs font-medium text-red-500">
                  {validationErrors.password}
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Confirm Password</Label>

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirm_password")}
                    className="h-11 pr-11"
                  />

                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <p className="min-h-4 text-xs font-medium text-red-500">
                  {validationErrors.confirm_password}
                </p>
              </div>
            </div>

            <div className="">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="terms-seller"
                  onCheckedChange={(v) => setValue("terms_accept", v)}
                />

                <Label
                  htmlFor="terms-seller"
                  className="text-sm font-medium text-muted-foreground"
                >
                  I accept the Terms & Conditions
                </Label>
              </div>

              <p className="mt-2 min-h-4 text-xs font-medium text-red-500">
                {validationErrors.terms_accept}
              </p>
            </div>

            <Button
              className="h-11 w-full gradient-button font-semibold"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Register as Seller"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SellerForm;
