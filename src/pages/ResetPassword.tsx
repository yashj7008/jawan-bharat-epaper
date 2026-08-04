import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Lock, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { auth, supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

type RecoveryState = "verifying" | "valid" | "invalid" | "success";

const MIN_PASSWORD_LENGTH = 6;

function getAuthErrorFromUrl(): string | null {
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const queryParams = new URLSearchParams(window.location.search);

  const errorDescription =
    hashParams.get("error_description") ||
    queryParams.get("error_description");
  const errorCode =
    hashParams.get("error") || queryParams.get("error");

  if (errorDescription) {
    return decodeURIComponent(errorDescription.replace(/\+/g, " "));
  }
  if (errorCode) {
    return decodeURIComponent(errorCode.replace(/\+/g, " "));
  }
  return null;
}

export function ResetPassword() {
  const navigate = useNavigate();
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("verifying");
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    const urlError = getAuthErrorFromUrl();
    if (urlError) {
      setRecoveryError(urlError);
      setRecoveryState("invalid");
      return;
    }

    let resolved = false;

    const resolveValid = () => {
      if (!resolved) {
        resolved = true;
        setRecoveryState("valid");
      }
    };

    const resolveInvalid = (message: string) => {
      if (!resolved) {
        resolved = true;
        setRecoveryError(message);
        setRecoveryState("invalid");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          resolveValid();
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        resolveInvalid(error.message);
        return;
      }
      if (session) {
        resolveValid();
      }
    });

    const timeout = window.setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        resolveValid();
      } else {
        resolveInvalid(
          "This password reset link is invalid, expired, or has already been used. Please request a new one."
        );
      }
    }, 2500);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, []);

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = "New password is required";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error(
          "Your reset session has expired. Please request a new password reset link."
        );
      }

      const { error } = await auth.updatePassword(password);
      if (error) throw error;

      await auth.signOut();

      setRecoveryState("success");
      toast({
        title: "Password Updated",
        description: "Your password has been reset. Please sign in with your new password.",
      });

      window.setTimeout(() => {
        navigate("/signin", { replace: true });
      }, 2000);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to reset password. Please try again.";

      toast({
        title: "Password Reset Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/signin"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Link>

        <Card className="w-full shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Reset Password
            </CardTitle>
            <CardDescription className="text-gray-600">
              {recoveryState === "verifying" && "Verifying your reset link..."}
              {recoveryState === "valid" && "Enter your new password below"}
              {recoveryState === "invalid" && "Unable to reset password"}
              {recoveryState === "success" && "Password updated successfully"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {recoveryState === "verifying" && (
              <div className="flex flex-col items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
                <p className="text-sm text-gray-500">Please wait...</p>
              </div>
            )}

            {recoveryState === "invalid" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center py-4">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                  <p className="text-sm text-gray-600">
                    {recoveryError ??
                      "This link is invalid or has expired."}
                  </p>
                </div>
                <Button asChild className="w-full h-11">
                  <Link to="/signin">Request a New Reset Link</Link>
                </Button>
              </div>
            )}

            {recoveryState === "success" && (
              <div className="flex flex-col items-center text-center py-4 space-y-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
                <p className="text-sm text-gray-600">
                  Redirecting you to sign in...
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/signin">Go to Sign In</Link>
                </Button>
              </div>
            )}

            {recoveryState === "valid" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 pr-10 h-11 ${errors.password ? "border-red-500" : ""}`}
                      disabled={isSubmitting}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isSubmitting}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-10 pr-10 h-11 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      disabled={isSubmitting}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isSubmitting}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Updating Password...
                    </span>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
