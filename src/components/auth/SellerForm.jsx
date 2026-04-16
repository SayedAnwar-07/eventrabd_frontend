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
          Registering as Seller
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
          <input type="hidden" {...register("role")} value="seller" />

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
              <Label className="mb-2">Service Area</Label>
              <Input
                placeholder="Only city name"
                {...register("service_area")}
              />
              <p className="text-red-500 text-sm">
                {validationErrors.service_area}
              </p>
            </div>

            <div className="w-full">
              <Label className="mb-2">Contact Number</Label>
              <Input
                placeholder="+8801XXXXXXXX"
                {...register("contact_number")}
              />
              <p className="text-red-500 text-sm">
                {validationErrors.contact_number}
              </p>
            </div>

            <div className="w-full">
              <Label className="mb-2">WhatsApp Number</Label>
              <Input
                placeholder="+8801XXXXXXXX"
                {...register("whatsapp_number")}
              />
              <p className="text-red-500 text-sm">
                {validationErrors.whatsapp_number}
              </p>
            </div>

            <div className="w-full sm:col-span-2">
              <Label className="mb-2">Bio (Optional)</Label>
              <Textarea
                placeholder="Write something about yourself..."
                {...register("bio")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
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

          <div className="flex flex-col gap-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms-seller"
                onCheckedChange={(v) => setValue("terms_accept", v)}
              />
              <Label
                htmlFor="terms-seller"
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
              "Register as Seller"
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

export default SellerForm;
