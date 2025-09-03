import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, UserPlus, UserCheck, AlertCircle, Eye, EyeOff } from "lucide-react";
import { UsersApiService, type User } from "@/lib/usersApi";
import { toast } from "@/hooks/use-toast";

interface UserFormProps {
  mode: "create" | "edit";
}

interface ValidationErrors {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  password?: string;
  confirmPassword?: string;
}

const UserForm = ({ mode }: UserFormProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    avatar: "",
    password: "",
    confirmPassword: "",
    role: "customer" as const,
    isActive: true
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      loadUser();
    }
  }, [mode, id]);

  const loadUser = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const user = await UsersApiService.getUserById(id);
      if (user) {
        setFormData({
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || "",
          avatar: user.avatar || "",
          password: "", // Don't load password for security
          confirmPassword: "",
          role: user.role,
          isActive: user.isActive
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Validation functions
  const validateUsername = (username: string): string | undefined => {
    if (!username.trim()) {
      return "Username is required";
    }
    if (username.length < 3) {
      return "Username must be at least 3 characters long";
    }
    if (username.length > 50) {
      return "Username must be less than 50 characters";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return "Username can only contain letters, numbers, underscores, and hyphens";
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "Email is required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    if (email.length > 255) {
      return "Email must be less than 255 characters";
    }
    return undefined;
  };

  const validateName = (name: string, fieldName: string): string | undefined => {
    if (!name.trim()) {
      return `${fieldName} is required`;
    }
    if (name.length < 2) {
      return `${fieldName} must be at least 2 characters long`;
    }
    if (name.length > 50) {
      return `${fieldName} must be less than 50 characters`;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (phone.trim() && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return "Please enter a valid phone number";
    }
    if (phone.length > 20) {
      return "Phone number must be less than 20 characters";
    }
    return undefined;
  };

  const validateAvatar = (avatar: string): string | undefined => {
    if (avatar.trim() && avatar.length > 255) {
      return "Avatar must be less than 255 characters";
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (mode === "create" && !password.trim()) {
      return "Password is required for new users";
    }
    if (password.trim() && password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (password.length > 128) {
      return "Password must be less than 128 characters";
    }
    if (password.trim() && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string): string | undefined => {
    if (mode === "create" && !confirmPassword.trim()) {
      return "Please confirm your password";
    }
    if (confirmPassword.trim() && confirmPassword !== formData.password) {
      return "Passwords do not match";
    }
    return undefined;
  };

  // Password strength indicator
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    
    const strength = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Very Weak', color: 'text-red-500' },
      { score: 2, label: 'Weak', color: 'text-orange-500' },
      { score: 3, label: 'Fair', color: 'text-yellow-500' },
      { score: 4, label: 'Good', color: 'text-blue-500' },
      { score: 5, label: 'Strong', color: 'text-green-500' }
    ];
    
    return strength[Math.min(score, 5)];
  };

  // Validate a single field
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'username':
        return validateUsername(value);
      case 'email':
        return validateEmail(value);
      case 'firstName':
        return validateName(value, 'First name');
      case 'lastName':
        return validateName(value, 'Last name');
      case 'phone':
        return validatePhone(value);
      case 'avatar':
        return validateAvatar(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(value);
      default:
        return undefined;
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    newErrors.username = validateUsername(formData.username);
    newErrors.email = validateEmail(formData.email);
    newErrors.firstName = validateName(formData.firstName, 'First name');
    newErrors.lastName = validateName(formData.lastName, 'Last name');
    newErrors.phone = validatePhone(formData.phone);
    newErrors.avatar = validateAvatar(formData.avatar);
    newErrors.password = validatePassword(formData.password);
    newErrors.confirmPassword = validateConfirmPassword(formData.confirmPassword);

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  // Handle input change with validation
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }));

    // Real-time validation for non-required fields or when field is touched
    if (field !== 'phone' && field !== 'avatar' || touched[field]) {
      const fieldError = validateField(field, value as string);
      if (fieldError) {
        setErrors(prev => ({ ...prev, [field]: fieldError }));
      }
    }
  };

  // Handle blur event for validation
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const fieldError = validateField(field, formData[field as keyof typeof formData] as string);
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = ['username', 'email', 'firstName', 'lastName', 'phone', 'avatar', 'password', 'confirmPassword'];
    const newTouched: Record<string, boolean> = {};
    allFields.forEach(field => newTouched[field] = true);
    setTouched(newTouched);
    
    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      if (mode === "create") {
        const userId = await UsersApiService.createUser(formData);
        toast({
          title: "Success",
          description: "User created successfully",
        });
        navigate(`/admin/users/edit/${userId}`);
      } else {
        await UsersApiService.updateUser(id!, formData);
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        navigate("/admin/users");
      }
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error instanceof Error ? error.message : (mode === "create" ? "Failed to create user" : "Failed to update user");
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to check if field has error
  const hasError = (field: string): boolean => {
    return touched[field] && !!errors[field as keyof ValidationErrors];
  };

  // Helper function to get error message
  const getErrorMessage = (field: string): string | undefined => {
    return touched[field] ? errors[field as keyof ValidationErrors] : undefined;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading user...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/users")}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === "create" ? "Create New User" : "Edit User"}
            </h1>
            <p className="text-gray-600">
              {mode === "create" ? "Add a new user to the system" : "Update user information"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
            <CardHeader>
          <CardTitle className="flex items-center">
            {mode === "create" ? (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                New User
              </>
            ) : (
              <>
                <UserCheck className="w-5 h-5 mr-2" />
                Edit User
              </>
            )}
          </CardTitle>
            </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center">
                  First Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  onBlur={() => handleBlur("firstName")}
                  className={hasError("firstName") ? "border-red-500 focus:border-red-500" : ""}
                  placeholder="Enter first name"
                  required
                />
                {getErrorMessage("firstName") && (
                  <div className="flex items-center text-sm text-red-500">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getErrorMessage("firstName")}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center">
                  Last Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  onBlur={() => handleBlur("lastName")}
                  className={hasError("lastName") ? "border-red-500 focus:border-red-500" : ""}
                  placeholder="Enter last name"
                  required
                />
                {getErrorMessage("lastName") && (
                  <div className="flex items-center text-sm text-red-500">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getErrorMessage("lastName")}
                  </div>
                )}
              </div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                  <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  onBlur={() => handleBlur("username")}
                  className={hasError("username") ? "border-red-500 focus:border-red-500" : ""}
                  placeholder="Enter a unique username"
                />
                {getErrorMessage("username") && (
                  <div className="flex items-center text-sm text-red-500">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getErrorMessage("username")}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Choose a unique username. Only letters, numbers, underscores, and hyphens allowed.
                </p>
                </div>

                <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  Email <span className="text-red-500 ml-1">*</span>
                </Label>
                  <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={hasError("email") ? "border-red-500 focus:border-red-500" : ""}
                  placeholder="Enter email address"
                  required
                />
                {getErrorMessage("email") && (
                  <div className="flex items-center text-sm text-red-500">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getErrorMessage("email")}
                  </div>
                  )}
                </div>
              </div>

            {/* Password Section - Only show for create mode */}
            {mode === "create" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center">
                    Password <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      className={hasError("password") ? "border-red-500 focus:border-red-500 pr-10" : "pr-10"}
                      placeholder="Enter password (min 8 characters)"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {getErrorMessage("password") && (
                    <div className="flex items-center text-sm text-red-500">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {getErrorMessage("password")}
                    </div>
                  )}
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              getPasswordStrength(formData.password).score <= 2 ? 'bg-red-500' :
                              getPasswordStrength(formData.password).score <= 3 ? 'bg-yellow-500' :
                              getPasswordStrength(formData.password).score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(getPasswordStrength(formData.password).score / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${getPasswordStrength(formData.password).color}`}>
                          {getPasswordStrength(formData.password).label}
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Must contain uppercase, lowercase, and number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center">
                    Confirm Password <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      onBlur={() => handleBlur("confirmPassword")}
                      className={hasError("confirmPassword") ? "border-red-500 focus:border-red-500 pr-10" : "pr-10"}
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {getErrorMessage("confirmPassword") && (
                    <div className="flex items-center text-sm text-red-500">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {getErrorMessage("confirmPassword")}
                    </div>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="flex items-center text-sm text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Passwords match
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  className={hasError("phone") ? "border-red-500 focus:border-red-500" : ""}
                  placeholder="Enter phone number (optional)"
                />
                {getErrorMessage("phone") && (
                  <div className="flex items-center text-sm text-red-500">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getErrorMessage("phone")}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  International format recommended (e.g., +1234567890)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar</Label>
                <Input
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => handleInputChange("avatar", e.target.value)}
                  onBlur={() => handleBlur("avatar")}
                  className={hasError("avatar") ? "border-red-500 focus:border-red-500" : ""}
                  placeholder="Enter emoji or image URL (optional)"
                />
                {getErrorMessage("avatar") && (
                  <div className="flex items-center text-sm text-red-500">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {getErrorMessage("avatar")}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Emoji (👤) or image URL
                </p>
              </div>
              </div>

            {/* Role and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center">
                  Role <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
                  <Label htmlFor="isActive">
                    {formData.isActive ? "Active" : "Inactive"}
                  </Label>
              </div>
                <p className="text-xs text-gray-500">
                  Active users can log in and use the system
                </p>
              </div>
        </div>

        {/* Submit Button */}
            <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
                onClick={() => navigate("/admin/users")}
                disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
                disabled={isSaving}
            className="min-w-[120px]"
          >
                {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                    {mode === "create" ? "Create User" : "Update User"}
              </>
            )}
          </Button>
        </div>
      </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserForm;
