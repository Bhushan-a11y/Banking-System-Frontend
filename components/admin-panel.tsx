"use client";

import { useState,useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, DollarSign, Activity, Search, User, Shield, Hash, Wallet, Loader2, UserPlus, Lock, Link2, CheckCircle2 } from "lucide-react";

const dummyAccounts = [
  { id: 1, accountNumber: "8091234567", ownerName: "Alex Thompson", balance: 14250.50, createdAt: "2024-01-15" },
  { id: 2, accountNumber: "8095678901", ownerName: "Sarah Johnson", balance: 52340.75, createdAt: "2023-06-22" },
  { id: 3, accountNumber: "8092345678", ownerName: "Michael Chen", balance: 8920.00, createdAt: "2024-03-10" },
  { id: 4, accountNumber: "8098765432", ownerName: "Emily Davis", balance: 125890.25, createdAt: "2022-11-05" },
  { id: 5, accountNumber: "8093456789", ownerName: "James Wilson", balance: 3450.80, createdAt: "2025-01-20" },
];

const dummyUsers = [
  { id: 1, userName: "alex_user", email: "alex@example.com", role: "USER", lastLogin: "2026-05-04 10:30", status: "Online" },
  { id: 2, userName: "admin_boss", email: "admin@industrialbank.com", role: "ADMIN", lastLogin: "2026-05-04 09:15", status: "Online" },
  { id: 3, userName: "sarah_j", email: "sarah@example.com", role: "USER", lastLogin: "2026-05-03 18:45", status: "Offline" },
  { id: 4, userName: "mike_chen", email: "mike@example.com", role: "USER", lastLogin: "2026-05-04 08:00", status: "Offline" },
  { id: 5, userName: "super_admin", email: "superadmin@industrialbank.com", role: "ADMIN", lastLogin: "2026-05-02 14:20", status: "Offline" },
];

interface UserLookupResult {
  userName: string;
  role: string;
  accountId: string;
  balance: number;
}
interface AccountData {
  accId: number;
  accno: string;
  balance: number;
  createdAt: string;
  ownerName: string;
}

interface UserData {
  userId: number;
  userName: string;
  roles: string[];
}

export function AdminPanel() {
  const [searchAccountNo, setSearchAccountNo] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [lookupResult, setLookupResult] = useState<UserLookupResult | null>(null);
  const [realAccounts, setRealAccounts] = useState<AccountData[]>([]);
  const [realUsers, setRealUsers] = useState<UserData[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  // --- ADMIN TRANSACTIONS STATE ---
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showUsers, setShowUsers] = useState(false); // Controls our button toggle!

  const fetchAllTransactions = async () => {
    try {
      const token = localStorage.getItem('bank_auth_token');
      // Calling our brand new God Mode endpoint!
      const res = await fetch(`http://localhost:8080/admin/transactions`, {
        method: 'GET',
        headers: { 'Authorization': token || "" }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAllTransactions(data);
      }
    } catch (err) {
      console.error("Failed to fetch admin transactions", err);
    }
  };

  // Fetch the data as soon as the Admin Panel loads!
  useEffect(() => {
    fetchAllTransactions();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch all real users from Spring Boot
      // NOTE: Make sure this URL matches your actual Spring Boot endpoint for getting all users!
      const userRes = await fetch(`http://localhost:8080/admin/get-all-users`, {
        headers: { 'Authorization': 'Basic ' + btoa('Shady:Shady') }
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        setRealUsers(userData);
      }

      // 2. Fetch all real accounts from Spring Boot
      // NOTE: Make sure this URL matches your actual Spring Boot endpoint for getting all accounts!
      const accRes = await fetch(`http://localhost:8080/admin/accounts/get-all-accounts`, {
        headers: { 'Authorization': 'Basic ' + btoa('Shady:Shady') }
      });

      if (accRes.ok) {
        const accData = await accRes.json();
        setRealAccounts(accData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };
  useEffect(() => {
    

    fetchDashboardData();
  }, []); // <-- This empty bracket is super important! It tells React to only run this ONCE when the page loads.

  // Create User State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newAccountId, setNewAccountId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState("");

  const totalBalance = realAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalUsers = realUsers.length;
  const totalAccounts = realAccounts.length;

  // --- CREATE ACCOUNT STATE ---
  const [accno, setAccno] = useState(""); 
  const [initialBalance, setInitialBalance] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setStatusMessage("Creating...");

    try {
      const token = localStorage.getItem('bank_auth_token');

      const response = await fetch(`http://localhost:8080/admin/accounts/create-account`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token || ""
        },
        // We are sending exactly what your Java Account class expects!
        body: JSON.stringify({
          accno: parseInt(accno), 
          balance: parseFloat(initialBalance)
        })
      });

      if (response.status === 201) {
        setStatusMessage("✅ Account successfully created!");
        setAccno(""); // Clear the fields so you can make another one
        setInitialBalance("");
      } else {
        setStatusMessage(`❌ Failed to create. Server returned: ${response.status}`);
      }

    } catch (err) {
      console.error(err);
      setStatusMessage("❌ Network error. Is Spring Boot running?");
    }
  };


  

  //--------------------------------------------
  
  const handleSearch = async () => {
    if (!searchAccountNo) return; 
    
    setIsSearching(true);
    setSearchError("");
    setLookupResult(null);

    try {
      // Using the hardcoded URL so we don't have to fight the .env file right now!
      const response = await fetch(`http://localhost:8080/admin/users/${searchAccountNo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('Shady:Shady') 
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setLookupResult(userData); 
      } else {
        setSearchError("User not found in database.");
      }
    } catch (err) {
      console.error("Connection failed:", err);
      setSearchError("Could not connect to the server.");
    } finally {
      setIsSearching(false);
    }
  };
  

    const handleCreateUser = async () => {
      // Basic validation
      if (!newUserName.trim() || !newPassword.trim() || !newAccountId.trim()) {
        setCreateError("Please fill in all fields.");
        return;
      }
  
      setIsCreating(true);
      setCreateError("");
      setCreateSuccess(false);
  
      try {
        const response = await fetch(`http://localhost:8080/admin/users/create-a-user`, {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('Shady:Shady') 
          },
          body: JSON.stringify({
            userName: newUserName,
            password: newPassword,
            accountId: parseInt(newAccountId) 
          })
        });
  
        if (response.ok) {
          setCreateSuccess(true);
          setNewUserName("");
          setNewPassword("");
          setNewAccountId("");
        } else {
          setCreateError("Failed to create user. Ensure the Account ID exists and Username is unique.");
        }
      } catch (err) {
        console.error("Connection failed:", err);
        setCreateError("Could not connect to the server.");
      } finally {
        setIsCreating(false);
      }
    };
    // --- CREATE ADMIN STATE ---
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminAccountId, setNewAdminAccountId] = useState(""); // Added Account ID!
  const [isAdminCreating, setIsAdminCreating] = useState(false);
  const [adminCreateSuccess, setAdminCreateSuccess] = useState(false);
  const [adminCreateError, setAdminCreateError] = useState("");

  const handleCreateAdmin = async () => {
    // Basic validation
    if (!newAdminName.trim() || !newAdminPassword.trim() || !newAdminAccountId.trim()) {
      setAdminCreateError("Please fill in all fields.");
      return;
    }

    setIsAdminCreating(true);
    setAdminCreateError("");
    setAdminCreateSuccess(false);

    try {
      const token = localStorage.getItem('bank_auth_token');
      
      // Matched exactly to your @PostMapping!
      const response = await fetch(`http://localhost:8080/admin/create-admin`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ""
        },
        // Matched exactly to your Admindetail.java class!
        body: JSON.stringify({
          adminName: newAdminName,
          password: newAdminPassword,
          accountId: parseInt(newAdminAccountId) 
        })
      });

      if (response.status === 201) {
        setAdminCreateSuccess(true);
        setNewAdminName("");
        setNewAdminPassword("");
        setNewAdminAccountId("");
      } else {
        setAdminCreateError(`Failed to create admin. Server returned: ${response.status}`);
      }
    } catch (err) {
      console.error("Connection failed:", err);
      setAdminCreateError("Could not connect to the server.");
    } finally {
      setIsAdminCreating(false);
    }
  };

  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState(""); // Optional, just for UI
  const [statusmessage, setStatusmessage] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransferring(true);
    setStatusMessage("Processing transfer...");

    try {
      const token = localStorage.getItem('bank_auth_token');

      const response = await fetch(`http://localhost:8080/transaction`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token || "" 
        },
        // IMPORTANT: Notice the spelling of 'recieverId' here matches your Java backend's getRecieverId()!
        body: JSON.stringify({
          recieverId: parseInt(recipientId),
          amount: parseFloat(amount)
        })
      });

      if (response.ok) {
        setStatusmessage("✅ Transfer successful!");
        setRecipientId("");
        setAmount("");
        setDescription("");
        if (typeof fetchDashboardData === 'function') {
          fetchDashboardData(); 
       }
      } else {
        // Since your backend returns the error message in a BAD_REQUEST, we can try to read it!
        const errorText = await response.text();
        setStatusMessage(`❌ Failed: ${errorText || "Invalid details or insufficient funds."}`);
      }
    } catch (err) {
      console.error("Transfer failed:", err);
      setStatusMessage("❌ Network error. Is Spring Boot running?");
    } finally {
      setIsTransferring(false);
    }
  };
 // --- DEPOSIT STATE & LOGIC ---
 const [depositAmount, setDepositAmount] = useState("");
 const [depositStatus, setDepositStatus] = useState("");
 const [isDepositing, setIsDepositing] = useState(false);

 const handleDeposit = async (e: React.FormEvent) => {
   e.preventDefault();
   setIsDepositing(true);
   setDepositStatus("Processing deposit...");

   try {
     const token = localStorage.getItem('bank_auth_token');
     const response = await fetch(`http://localhost:8080/transaction/deposit`, {
       method: 'POST',
       headers: { 
         'Content-Type': 'application/json',
         'Authorization': token || "" 
       },
       body: JSON.stringify({ amount: parseFloat(depositAmount) }) // Matches your WD class!
     });

     if (response.ok) {
       setDepositStatus("✅ Deposit successful!");
       setDepositAmount("");
       // Auto-refresh the balances!
       if (typeof fetchDashboardData === 'function') fetchDashboardData();
     } else {
       setDepositStatus("❌ Deposit failed. Please try again.");
     }
   } catch (err) {
     console.error(err);
     setDepositStatus("❌ Network error.");
   } finally {
     setIsDepositing(false);
   }
 };

 // --- WITHDRAWAL STATE & LOGIC ---
 const [withdrawAmount, setWithdrawAmount] = useState("");
 const [withdrawStatus, setWithdrawStatus] = useState("");
 const [isWithdrawing, setIsWithdrawing] = useState(false);

 const handleWithdrawal = async (e: React.FormEvent) => {
   e.preventDefault();
   setIsWithdrawing(true);
   setWithdrawStatus("Processing withdrawal...");

   try {
     const token = localStorage.getItem('bank_auth_token');
     const response = await fetch(`http://localhost:8080/transaction/withdrawal`, {
       method: 'POST',
       headers: { 
         'Content-Type': 'application/json',
         'Authorization': token || "" 
       },
       body: JSON.stringify({ amount: parseFloat(withdrawAmount) }) // Matches your WD class!
     });

     if (response.ok) {
       setWithdrawStatus("✅ Withdrawal successful!");
       setWithdrawAmount("");
       // Auto-refresh the balances!
       if (typeof fetchDashboardData === 'function') fetchDashboardData();
     } else {
       // We know from your backend logic this usually means insufficient funds!
       setWithdrawStatus("❌ Failed. Insufficient funds?");
     }
   } catch (err) {
     console.error(err);
     setWithdrawStatus("❌ Network error.");
   } finally {
     setIsWithdrawing(false);
   }
 };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">Manage accounts and users</p>
      </div>

      {/* Create New User Section */}
      <Card className="bg-card/80 border-primary/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-primary/5 pointer-events-none" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-500" />
              Provision Web User
            </CardTitle>
            <Button
              variant={showCreateForm ? "secondary" : "default"}
              size="sm"
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setCreateError("");
                setCreateSuccess(false);
              }}
              className={showCreateForm ? "bg-secondary hover:bg-secondary/80" : "bg-green-600 hover:bg-green-700 text-white"}
            >
              {showCreateForm ? "Cancel" : "Create New User"}
            </Button>
          </div>
        </CardHeader>
        
        {showCreateForm && (
          <CardContent className="relative space-y-4 pt-0">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Temporary Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter temporary password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  Link to Account ID
                </label>
                <Input
                  type="number"
                  placeholder="Enter account ID"
                  value={newAccountId}
                  onChange={(e) => setNewAccountId(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Error Message */}
            {createError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-md border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {createError}
              </div>
            )}

            {/* Success Message */}
            {createSuccess && (
              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 px-3 py-2 rounded-md border border-green-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                User successfully provisioned.
              </div>
            )}

            <Button
              onClick={handleCreateUser}
              disabled={isCreating}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {isCreating ? "Provisioning..." : "Provision User"}
            </Button>
          </CardContent>
          
        
        )}
        </Card>

        {/* Deposit & Withdrawal Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          
          {/* DEPOSIT CARD */}
          <Card className="bg-card/80 border-primary/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-primary/5 pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Deposit Funds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Amount to Deposit ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 500.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    className="bg-secondary/50 border-border/50 focus:border-green-500"
                  />
                </div>

                {depositStatus && (
                  <div className={`text-sm px-3 py-2 rounded-md border ${
                    depositStatus.includes('✅') ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}>
                    {depositStatus}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isDepositing || !depositAmount}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isDepositing ? "Processing..." : "Deposit"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* WITHDRAWAL CARD */}
          <Card className="bg-card/80 border-primary/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-primary/5 pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-500" />
                Withdraw Funds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdrawal} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Amount to Withdraw ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 100.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                    className="bg-secondary/50 border-border/50 focus:border-orange-500"
                  />
                </div>

                {withdrawStatus && (
                  <div className={`text-sm px-3 py-2 rounded-md border ${
                    withdrawStatus.includes('✅') ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}>
                    {withdrawStatus}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isWithdrawing || !withdrawAmount}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isWithdrawing ? "Processing..." : "Withdraw"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
        </div>

        {/* New Transfer Card */}
        <Card className="bg-card/80 border-primary/20 backdrop-blur-sm relative overflow-hidden mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              New Transfer
            </CardTitle>
            <p className="text-sm text-muted-foreground">Enter the recipient details and amount</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleTransfer} className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Recipient Account ID</label>
                <Input
                  type="number"
                  placeholder="Enter Account ID"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Amount ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description (Optional)</label>
                <Input
                  type="text"
                  placeholder="What is this transfer for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>

              {/* Status Message Display */}
              {statusMessage && (
                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md border ${
                  statusMessage.includes('✅') 
                    ? 'text-green-400 bg-green-500/10 border-green-500/20' 
                    : 'text-red-400 bg-red-500/10 border-red-500/20'
                }`}>
                  {statusMessage}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isTransferring || !recipientId || !amount}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all"
              >
                {isTransferring ? "Processing..." : "→ Transfer Funds"}
              </Button>
            </form>
          </CardContent>
        </Card>
        {/* Create New Admin Section */}
      <Card className="bg-card/80 border-primary/20 backdrop-blur-sm relative overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-primary/5 pointer-events-none" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              Provision System Admin
            </CardTitle>
            <Button
              variant={showAdminForm ? "secondary" : "default"}
              size="sm"
              onClick={() => {
                setShowAdminForm(!showAdminForm);
                setAdminCreateError("");
                setAdminCreateSuccess(false);
              }}
              className={showAdminForm ? "bg-secondary hover:bg-secondary/80" : "bg-indigo-600 hover:bg-indigo-700 text-white"}
            >
              {showAdminForm ? "Cancel" : "Create New Admin"}
            </Button>
          </div>
        </CardHeader>
        
        {showAdminForm && (
          <CardContent className="relative space-y-4 pt-0">
            {/* Changed to 3 columns to fit the new Account ID box! */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Admin Username
                </label>
                <Input
                  type="text"
                  placeholder="Enter admin name"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Secure Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter secure password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  Link to Account ID
                </label>
                <Input
                  type="number"
                  placeholder="Enter account ID"
                  value={newAdminAccountId}
                  onChange={(e) => setNewAdminAccountId(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Error Message */}
            {adminCreateError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-md border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {adminCreateError}
              </div>
            )}

            {/* Success Message */}
            {adminCreateSuccess && (
              <div className="flex items-center gap-2 text-indigo-400 text-sm bg-indigo-500/10 px-3 py-2 rounded-md border border-indigo-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                Admin successfully provisioned.
              </div>
            )}

            <Button
              onClick={handleCreateAdmin}
              disabled={isAdminCreating || !newAdminName || !newAdminPassword || !newAdminAccountId}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              {isAdminCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              {isAdminCreating ? "Provisioning..." : "Provision Admin"}
            </Button>
          </CardContent>
        )}
      </Card>
     {/* Create New Bank Account Section */}
     <Card className="bg-card/80 border-primary/20 backdrop-blur-sm relative overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <CardHeader className="relative">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Provision New Bank Account
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              
              {/* FIELD 1: ACCOUNT NUMBER */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  Account Number
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 48594901234"
                  value={accno}
                  onChange={(e) => setAccno(e.target.value)}
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
                />
              </div>

              {/* FIELD 2: INITIAL DEPOSIT */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  Initial Deposit ($)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 5000"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Status Message Display */}
            {statusMessage && (
              <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md border ${
                statusMessage.includes('✅') 
                  ? 'text-green-400 bg-green-500/10 border-green-500/20' 
                  : 'text-red-400 bg-red-500/10 border-red-500/20'
              }`}>
                {statusMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={!accno || !initialBalance || statusMessage === "Creating..."}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {statusMessage === "Creating..." ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {statusMessage === "Creating..." ? "Provisioning..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* User Lookup Section */}
      <Card className="bg-card/80 border-primary/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <CardHeader className="relative">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Lookup User by Account
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter Account Number (e.g., 8091234567)"
                value={searchAccountNo}
                onChange={(e) => setSearchAccountNo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 min-w-[120px]"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Error Message */}
          {searchError && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-md border border-red-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {searchError}
            </div>
          )}

          {/* Result Card */}
          {lookupResult && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <Card className="bg-gradient-to-br from-secondary/80 to-secondary/40 border-primary/30 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <CardHeader className="pb-2 relative">
                  <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    User Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        Username
                      </div>
                      <p className="text-lg font-semibold text-foreground">{lookupResult.userName}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        Role
                      </div>
                      <p className={`text-lg font-semibold ${lookupResult.role === "ADMIN" ? "text-primary" : "text-foreground"}`}>
                        {lookupResult.role}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Hash className="h-3 w-3" />
                        Account ID
                      </div>
                      <p className="text-lg font-semibold text-foreground font-mono">{lookupResult.accountId}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Wallet className="h-3 w-3" />
                        Balance
                      </div>
                      <p className="text-lg font-semibold text-green-500">
                        ${lookupResult.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Accounts</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalAccounts}</div>
            <p className="text-xs text-muted-foreground mt-1">Bank accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Operational</div>
            <p className="text-xs text-muted-foreground mt-1">All systems running</p>
          </CardContent>
        </Card>
      </div>

      {/* 🚀 PASTE THE GLOBAL TRANSACTIONS BLOCK RIGHT HERE 🚀 */}
      <Card className="bg-card/80 border-primary/20 backdrop-blur-sm relative overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-primary/5 pointer-events-none" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Global Transaction History
            </CardTitle>
            <Button
              variant={showTransactions ? "secondary" : "default"}
              size="sm"
              onClick={() => setShowTransactions(!showTransactions)}
              className={showTransactions ? "bg-secondary hover:bg-secondary/80" : "bg-blue-600 hover:bg-blue-700 text-white"}
            >
              {showTransactions ? "Hide Transactions" : "View All Transactions"}
            </Button>
          </div>
        </CardHeader>
        
        {showTransactions && (
          <CardContent className="relative pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sender</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Receiver</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4 text-muted-foreground">No transactions found.</td></tr>
                  ) : (
                    allTransactions.map((tx, index) => {
                      const rawType = tx.transactionType || tx.TransactionType || tx.transType || "Transfer";
                      const displayType = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
                      
                      return (
                        <tr key={tx.transactionId || tx.id || tx.transId || index} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                          <td className="py-3 px-4 text-sm font-mono text-foreground">{tx.transactionId || tx.id || tx.transId}</td>
                          <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{tx.senderAccount}</td>
                          <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{tx.receiverAccount}</td>
                          <td className="py-3 px-4">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
                              {displayType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {tx.date || tx.madeAT || "Recent"}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-right text-foreground">
                            ${(tx.amount || tx.transAmount || 0).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
      {/* --------------------------------------------------- */}
{/* All Accounts Table */}
<Card className="bg-card/80 border-border/50 backdrop-blur-sm mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            All Accounts
          </CardTitle>
          <Button
            variant={showAccounts ? "secondary" : "default"}
            size="sm"
            onClick={() => setShowAccounts(!showAccounts)}
            className={showAccounts ? "bg-secondary hover:bg-secondary/80" : "bg-primary hover:bg-primary/90 text-primary-foreground"}
          >
            {showAccounts ? "Hide Accounts" : "View All Accounts"}
          </Button>
        </CardHeader>
        
        {showAccounts && (
          <CardContent className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Account ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Account Number</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Owner</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {realAccounts.map((account) => (
                    <tr key={account.accno} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-foreground">{account.accId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-foreground">{account.accno}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-foreground">{account.ownerName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{account.createdAt}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-semibold text-foreground">
                          ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

 {/* All Users Table */}
 <Card className="bg-card/80 border-border/50 backdrop-blur-sm mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            All Users
          </CardTitle>
          <Button
            variant={showUsers ? "secondary" : "default"}
            size="sm"
            onClick={() => setShowUsers(!showUsers)}
            className={showUsers ? "bg-secondary hover:bg-secondary/80" : "bg-primary hover:bg-primary/90 text-primary-foreground"}
          >
            {showUsers ? "Hide Users" : "View All Users"}
          </Button>
        </CardHeader>

        {showUsers && (
          <CardContent className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Username</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Login</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {realUsers.map((user) => (
                    <tr key={user.userId} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-foreground">{user.userName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-foreground">{user.userId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">N/A</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          user.roles && user.roles[0] === "ADMIN" 
                            ? "bg-primary/10 text-primary" 
                            : "bg-secondary text-foreground"
                        }`}>
                          {user.roles && user.roles.length > 0 ? user.roles[0] : "USER"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">Never</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm text-muted-foreground">Online</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}




