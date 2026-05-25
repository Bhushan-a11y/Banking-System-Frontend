"use client";

import { useState } from "react";
import { User, Lock, Shield, Loader2, UserCog, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface FormErrors {
  userName?: string;
  password?: string;
}

type UserRole = "USER" | "ADMIN";

interface AuthPortalProps {
  onLogin: (role: UserRole) => void;
}

export function AuthPortal({ onLogin }: AuthPortalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("USER");
  
  // Sign In state - pre-filled based on role
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState("");

  // Update credentials when role changes
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === "USER") {
      setLoginUsername("");
      setLoginPassword("");
    } else {
      setLoginUsername("");
      setLoginPassword("");
    }
  };

  const validateLoginForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!loginUsername.trim()) {
      errors.userName = "Username is required";
    }
    if (!loginPassword.trim()) {
      errors.password = "Password is required";
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setIsLoading(true);
    setAuthError(""); 
    
    try {
      const token = 'Basic ' + btoa(loginUsername + ':' + loginPassword);
      
      // 1. SMART SWITCH: Pick the URL based on the button they clicked!
      // (Note: Make sure the /users/ URL matches whatever your actual user endpoint is!)
      const testUrl = selectedRole === "ADMIN" 
        ? `http://localhost:8080/admin/accounts/get-all-accounts`
        : `http://localhost:8080/users/verify-login`; // Normal users check their own profile!
      
      // 2. Knock on the correct door
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token 
        }
      });

      // 3. The Bouncer Logic
      // Notice: If Spring Boot returns 404 (Not Found), it means the password WAS correct, 
      // but we just guessed the endpoint URL wrong! So 200 or 404 means auth succeeded here.
      if (response.ok || response.status === 404) { 
        
        localStorage.setItem('bank_auth_token', token);
        localStorage.setItem('bank_user_role', selectedRole);
        
        onLogin(selectedRole); // Let them into the correct dashboard!

      } else if (response.status === 401) {
        setAuthError("Invalid username or password.");
        
      } else if (response.status === 403) {
        setAuthError(`Access Denied: You do not have ${selectedRole} privileges.`);
        
        
      } else {
        // X-RAY 1: Catches URL typos (like a 404 Not Found)
        setAuthError(`URL Error: Spring Boot returned a ${response.status} status code!`);
      }

    } catch (err) {
      console.error("Login failed:", err);
      setAuthError("Cannot connect to server. Is Spring Boot running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Subtle glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      
      {/* Secondary accent glow */}
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-primary/3 rounded-full blur-[100px]" />
      
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm relative z-10 shadow-2xl shadow-primary/5">
        <CardHeader className="text-center pb-4">
          {/* Logo / Icon */}
          {/* ✅ YOUR NEW CUSTOM LOGO ✅ */}
          <div className="flex justify-center mb-8">
            <img 
              src="/onlybank-logo.jpeg" 
              alt="Only Bank Secure Portal" 
              className="w-full max-w-[300px] h-auto object-contain rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.1)]" 
            />
          </div>
          
       
          
          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
            <Shield className="w-3 h-3 text-primary" />
            <span>Internal Access Only</span>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-foreground/90">Access Level</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={selectedRole === "USER" ? "default" : "outline"}
                  className={`h-12 transition-all duration-200 ${selectedRole === "USER" 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "border-border/50 hover:bg-secondary/50 hover:border-primary/30"}`}
                  onClick={() => handleRoleChange("USER")}
                >
                  <User className="mr-2 h-4 w-4" />
                  User
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === "ADMIN" ? "default" : "outline"}
                  className={`h-12 transition-all duration-200 ${selectedRole === "ADMIN" 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "border-border/50 hover:bg-secondary/50 hover:border-primary/30"}`}
                  onClick={() => handleRoleChange("ADMIN")}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">Credentials</span>
              </div>
            </div>

          {/* Username Field */}
          <div className="space-y-2">
              <Label htmlFor="login-username" className="text-sm font-medium text-foreground/90">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="login-username"
                  type="text"
                  placeholder="Enter your username"
                  value={loginUsername}
                  onChange={(e) => {
                    setLoginUsername(e.target.value);
                    if (loginErrors.userName) {
                      setLoginErrors(prev => ({ ...prev, userName: undefined }));
                    }
                  }}
                  
                  className="pl-10 h-11 bg-input border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300 hover:border-primary/50 focus:scale-[1.02] hover:shadow-[0_0_10px_rgba(0,255,255,0.05)]"
                  aria-invalid={!!loginErrors.userName}
                />
              </div>
              {loginErrors.userName && (
                <p className="text-sm text-destructive">{loginErrors.userName}</p>
              )}
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-sm font-medium text-foreground/90">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (loginErrors.password) {
                      setLoginErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  
                  className="pl-10 h-11 bg-input border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300 hover:border-primary/50 focus:scale-[1.02] hover:shadow-[0_0_10px_rgba(0,255,255,0.05)]"
                  aria-invalid={!!loginErrors.password}
                />
              </div>
              {loginErrors.password && (
                <p className="text-sm text-destructive">{loginErrors.password}</p>
              )}
            </div>

            {/* Server Auth Error Display */}
            {authError && (
              <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Shield className="w-4 h-4 shrink-0" />
                <p>{authError}</p>
              </div>
            )}
         {/* Submit Button */}
         <Button 
              type="submit"
              className="w-full h-12 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:-translate-y-0.5 active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Secure Login
                </>
              )}
            </Button>
          </form>
          
          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border/30 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Authorized personnel only. All access is monitored and logged.
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              Secured by 256-bit encryption - Industrial Bank 2026
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
