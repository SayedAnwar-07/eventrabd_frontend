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
import { customerRegisterSchema } from "@/validation/registerSchema";

const CustomerForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [dismissedError, setDismissedError] = useState(null);
  const errorKey = error ? JSON.stringify(error) : null;
  const errorVisible = !!errorKey && errorKey !== dismissedError;
  const handleDismissError = () => setDismissedError(errorKey);

  // Manual error state for Zod validation
  const [validationErrors, setValidationErrors] = useState({});

  const { register, handleSubmit, setValue } = useForm({
    // Removed resolver
    defaultValues: { role: "customer", terms_accept: false },
  });

  const onSubmit = (data) => {
    // Clear previous manual validation errors
    setValidationErrors({});

    // Manually parse the data using the schema
    const result = customerRegisterSchema.safeParse(data);

    if (!result.success) {
      // Convert Zod errors into a flat object: { fieldName: "ErrorMessage" }
      const formattedErrors = result.error.format();
      const errorMap = {};

      Object.keys(formattedErrors).forEach((key) => {
        if (formattedErrors[key]?._errors) {
          errorMap[key] = formattedErrors[key]._errors[0];
        }
      });

      setValidationErrors(errorMap);
      return; // Stop the submission
    }

    // If validation passes
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background text-foreground">
      <div className="w-full max-w-xl">
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Choose a different role
        </button>

        <div className="mb-4 inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Registering as Customer
        </div>

        {errorVisible && (
          <div className="mb-4 flex items-start justify-between bg-red-50 border border-red-300 text-red-700 p-3 rounded-lg shadow-sm">
            <div className="flex-1 text-sm">
              {error.detail || error.email || JSON.stringify(error)}
            </div>
            <button
              type="button"
              onClick={handleDismissError}
              className="ml-3 text-red-600 hover:text-red-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <p className="text-green-500 text-center mb-4 text-sm">
            Registration successful! Redirecting…
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...register("role")} value="customer" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="w-full sm:col-span-2">
              <Label className="mb-2">Full Name</Label>
              <Input placeholder="Full Name" {...register("full_name")} />
              <p className="text-red-500 text-sm">
                {validationErrors.full_name}
              </p>
            </div>

            <div className="w-full sm:col-span-2">
              <Label className="mb-2">Email</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                {...register("email")}
              />
              <p className="text-red-500 text-sm">{validationErrors.email}</p>
            </div>

            <div className="w-full sm:col-span-2">
              <Label className="mb-2">Contact Number</Label>
              <Input
                placeholder="+8801XXXXXXXX"
                {...register("contact_number")}
              />
              <p className="text-red-500 text-sm">
                {validationErrors.contact_number}
              </p>
            </div>

            <div className="w-full sm:col-span-2">
              <Label className="mb-2">Bio (Optional)</Label>
              <Textarea
                placeholder="Write something about yourself..."
                {...register("bio")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
              <p className="text-red-500 text-sm">{validationErrors.bio}</p>
            </div>

            <div className="w-full sm:col-span-2 relative">
              <Label className="mb-2">Password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-7.5 text-muted-foreground"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
              <p className="text-red-500 text-sm">
                {validationErrors.password}
              </p>
            </div>

            <div className="w-full sm:col-span-2 relative">
              <Label className="mb-2">Confirm Password</Label>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirm_password")}
              />
              <button
                type="button"
                className="absolute right-3 top-7.5 text-muted-foreground"
                onClick={() => setShowConfirmPassword((v) => !v)}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
              <p className="text-red-500 text-sm">
                {validationErrors.confirm_password}
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms-customer"
                onCheckedChange={(v) => setValue("terms_accept", v)}
              />
              <Label
                htmlFor="terms-customer"
                className="text-sm text-muted-foreground"
              >
                I accept the Terms & Conditions
              </Label>
            </div>
            <p className="text-red-500 text-sm">
              {validationErrors.terms_accept}
            </p>
          </div>

          <Button
            className="w-full gradient-button"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
              </>
            ) : (
              "Register as Customer"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="underline text-primary">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
