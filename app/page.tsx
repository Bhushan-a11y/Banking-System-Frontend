"use client";

import { useState } from "react";
import { AuthPortal } from "@/components/auth-portal";
import { DashboardLayout } from "@/components/dashboard-layout";

type UserRole = "USER" | "ADMIN";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("USER");

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole("USER");
  };

  if (isLoggedIn) {
    return <DashboardLayout role={userRole} onLogout={handleLogout} />;
  }

  return <AuthPortal onLogin={handleLogin} />;
}
