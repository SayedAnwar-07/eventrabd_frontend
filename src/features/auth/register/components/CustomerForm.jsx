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
              Registering as Customer
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              Create customer account
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Add your information to find and book event services.
            </p>
          </div>

          {errorVisible && (
            <div className="relative mb-5">
              <GlobalErrorMessage error={error} />

              <button
                type="button"
                onClick={handleDismissError}
                className="absolute right-3 top-3 text-red-600 transition hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register("role")} value="customer" />

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
            </div>

            <div className="">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="terms-customer"
                  onCheckedChange={(v) => setValue("terms_accept", v)}
                />

                <Label
                  htmlFor="terms-customer"
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
                "Register as Customer"
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

export default CustomerForm;
