import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, User, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const SignUpModal = ({ open, onClose, onSwitchToLogin }: SignUpModalProps) => {
  const { register } = useUser();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Use the real register function from UserContext
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: undefined // Add phone field if needed
      });
      
      // Close modal on successful registration
      onClose();
      
      // Clear form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});
      setAgreedToTerms(false);
      
    } catch (error: any) {
      console.error("Signup failed:", error);
      // Show error message
      setErrors({ 
        general: error.message || "Registration failed. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
    onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div className="w-full max-w-2xl mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-gray-50/50 to-white backdrop-blur-xl border border-gray-200/20 overflow-hidden rounded-3xl">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden rounded-t-3xl">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Join Hargeisa Vibes</h1>
                    <p className="text-blue-100 text-sm">Start your adventure today</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full hover:bg-white/20 text-white hover:text-white transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
                </div>
            </div>

          <CardContent className="p-6 rounded-b-3xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields - Side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 group">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span>First Name</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={cn(
                        "h-10 px-4 border-2 transition-all duration-300 group-hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl",
                        errors.firstName 
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                          : "border-gray-200"
                      )}
                    />
                    {formData.firstName && !errors.firstName && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-95 duration-200" />
                    )}
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-600 animate-in slide-in-from-top-2 duration-200 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>{errors.firstName}</span>
                    </p>
                  )}
                </div>
                
                <div className="space-y-1.5 group">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span>Last Name</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={cn(
                        "h-10 px-4 border-2 transition-all duration-300 group-hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl",
                        errors.lastName 
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                          : "border-gray-200"
                      )}
                    />
                    {formData.lastName && !errors.lastName && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-95 duration-200" />
                    )}
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-red-600 animate-in slide-in-from-top-2 duration-200 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>{errors.lastName}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5 group">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>Email Address</span>
                </Label>
                <div className="relative">
                                      <Input
                      id="email"
                    type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={cn(
                        "h-10 px-4 border-2 transition-all duration-300 group-hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl",
                        errors.email 
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                          : "border-gray-200"
                      )}
                    />
                  {formData.email && !errors.email && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-95 duration-200" />
                  )}
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 animate-in slide-in-from-top-2 duration-200 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Fields - Side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 group">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-blue-500" />
                    <span>Password</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                    type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={cn(
                        "h-10 px-4 pr-12 border-2 transition-all duration-300 group-hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl",
                        errors.password 
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                          : "border-gray-200"
                      )}
                    />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 animate-in slide-in-from-top-2 duration-200 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>{errors.password}</span>
                    </p>
                  )}
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <span className="font-medium">Password must contain:</span>
                    <ul className="mt-1 space-y-1">
                      <li className={cn("flex items-center space-x-2", formData.password.length >= 8 ? "text-green-600" : "text-gray-400")}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", formData.password.length >= 8 ? "bg-green-500" : "bg-gray-300")}></span>
                        <span>At least 8 characters</span>
                      </li>
                      <li className={cn("flex items-center space-x-2", /[a-z]/.test(formData.password) ? "text-green-600" : "text-gray-400")}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", /[a-z]/.test(formData.password) ? "bg-green-500" : "bg-gray-300")}></span>
                        <span>One lowercase letter</span>
                      </li>
                      <li className={cn("flex items-center space-x-2", /[A-Z]/.test(formData.password) ? "text-green-600" : "text-gray-400")}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", /[A-Z]/.test(formData.password) ? "bg-green-500" : "bg-gray-300")}></span>
                        <span>One uppercase letter</span>
                      </li>
                      <li className={cn("flex items-center space-x-2", /\d/.test(formData.password) ? "text-green-600" : "text-gray-400")}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", /\d/.test(formData.password) ? "bg-green-500" : "bg-gray-300")}></span>
                        <span>One number</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-1.5 group">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-blue-500" />
                    <span>Confirm Password</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={cn(
                        "h-10 px-4 pr-12 border-2 transition-all duration-300 group-hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl",
                        errors.confirmPassword 
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                          : "border-gray-200"
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                  </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 animate-in slide-in-from-top-2 duration-200 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>{errors.confirmPassword}</span>
                    </p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded-2xl border border-green-100 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Passwords match!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                  />
                  <div className="flex-1">
                    <Label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                      I agree to the{" "}
                      <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline transition-colors duration-200">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline transition-colors duration-200">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                </div>
                {errors.terms && (
                  <p className="text-sm text-red-600 animate-in slide-in-from-top-2 duration-200 flex items-center space-x-1 ml-7">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span>{errors.terms}</span>
                  </p>
                )}
              </div>

              {/* General Error Display */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{errors.general}</p>
                </div>
              )}

              {/* Submit Button */}
                <Button
                  type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                    </div>
                  ) : (
                  <div className="flex items-center space-x-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  )}
                </Button>

              {/* Switch to Login */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors duration-200 hover:no-underline"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUpModal;
