"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, clearError } from "@/store/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );
  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen flex items-center px-4 py-10 bg-background text-foreground">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">
          Login to your account
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Enter your email below to login
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
            {typeof error === "string"
              ? error
              : error?.detail
                ? error.detail
                : Array.isArray(error?.non_field_errors)
                  ? error.non_field_errors[0]
                  : "Something went wrong"}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="mb-2">Email</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Label className="mb-2">Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-7.5 text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="">
            <Link
              to="/forgot-password"
              className="text-xs text-left hover:underline"
            >
              Forgot Password
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full gradient-button"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              "Login"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-2">
            Don’t have an account?{" "}
            <Link to="/register" className="underline text-primary">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
