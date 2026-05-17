"use client";

import { useState,useEffect } from "react";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Shield, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDashboard } from "./user-dashboard";
import { TransferFunds } from "./transfer-funds";
import { AdminPanel } from "./admin-panel";
import { cn } from "@/lib/utils";

type View = "dashboard" | "transfer" | "admin";
type UserRole = "USER" | "ADMIN";

interface DashboardLayoutProps {
  role: UserRole;
  onLogout: () => void;
}

export function DashboardLayout({ role, onLogout }: DashboardLayoutProps) {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileName, setProfileName] = useState("Loading...");
  const [profileRole, setProfileRole] = useState("...");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('bank_auth_token');
        const res = await fetch(`http://localhost:8080/users/get-a-user`, {
          headers: { 'Authorization': token || "" }
        });
        if (res.ok) {
          const data = await res.json();
          setProfileName(data.userName);
          // If your user has a role, set it here. Otherwise, just default to "User"
          setProfileRole(data.role || "User"); 
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const navItems = [
    { id: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard, allowedRoles: ["USER", "ADMIN"] },
    { id: "transfer" as View, label: "Transfer Funds", icon: ArrowLeftRight, allowedRoles: ["USER", "ADMIN"] },
    { id: "admin" as View, label: "Admin Panel", icon: Shield, allowedRoles: ["ADMIN"] },
  ];

  const filteredNavItems = navItems.filter(item => item.allowedRoles.includes(role));

  const handleLogout = () => {
    localStorage.removeItem('bank_auth_token');
    localStorage.removeItem('bank_user_role');
    onLogout();
  };

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <UserDashboard />;
      case "transfer":
        return <TransferFunds />;
      case "admin":
        return role === "ADMIN" ? <AdminPanel /> : <UserDashboard />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-sm border-b border-border/50 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">Industrial Bank</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-foreground"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-card/80 backdrop-blur-sm border-r border-border/50 z-50 transition-transform duration-300",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-border/50">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-bold text-foreground">Industrial Bank</span>
              <p className="text-xs text-muted-foreground capitalize">{role.toLowerCase()} Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                  currentView === item.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {currentView === item.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>

{/* User Info & Logout */}
<div className="p-4 border-t border-border/50">
            
            {/* Dynamic Profile Box */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 mb-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                {profileName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate">{profileName}</p>
                {/* Fallback to the 'role' prop if profileRole isn't loaded yet */}
                <p className="text-xs text-muted-foreground truncate">{profileRole !== "..." ? profileRole : role}</p>
              </div>
            </div>
            
            {/* The REAL Sign Out Button */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>

          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
