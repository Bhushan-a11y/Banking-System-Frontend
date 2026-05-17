"use client";

import { useState,useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 3. All the Icons we used in the User Dashboard
import {  DollarSign,  Send } from "lucide-react";

// ... your other imports (like lucide-react icons, components, etc.)

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CreditCard } from "lucide-react";


const transactions = [
  { id: 101, senderAccount: "8091234567", receiverAccount: "9988776655", transactionType: "Transfer", date: "2026-05-04", amount: 500.00 },
  { id: 102, senderAccount: "SYSTEM", receiverAccount: "8091234567", transactionType: "Deposit", date: "2026-05-01", amount: 4000.00 },
  { id: 103, senderAccount: "8091234567", receiverAccount: "5544332211", transactionType: "Transfer", date: "2026-05-01", amount: 1200.00 },
  { id: 104, senderAccount: "8091234567", receiverAccount: "CASH", transactionType: "Withdrawal", date: "2026-04-30", amount: 200.00 },
  { id: 105, senderAccount: "7766554433", receiverAccount: "8091234567", transactionType: "Transfer", date: "2026-04-28", amount: 750.00 },
];

export function UserDashboard() {
  // --- REAL DATA STATE ---
  const [currentBalance, setCurrentBalance] = useState(0);
  const [accountNumber, setAccountNumber] = useState("");
  const [userName, setUserName] = useState("User");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('bank_auth_token');
      
      // 1. Fetch the Logged-in User's Profile
      const profileRes = await fetch(`http://localhost:8080/users/get-a-user`, { 
        method: 'GET',
        headers: { 'Authorization': token || "" }
      });

      if (profileRes.ok) {
        const userData = await profileRes.json();
        
        setUserName(userData.userName);
        setAccountNumber(userData.accountNo);
        setCurrentBalance(userData.balance);

        // 2. CHAIN FETCH: Now that we know their ID, fetch their specific history!
        // Using your exact endpoint format: /transaction/{accId}
        const txRes = await fetch(`http://localhost:8080/transaction/${userData.accId}`, { 
          method: 'GET',
          headers: { 'Authorization': token || "" }
        });

        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData); 
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run this once when the page loads!
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- TRANSFER STATE ---
  const [recipientId, setRecipientId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferStatus, setTransferStatus] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // --- DEPOSIT STATE ---
  const [depositAmount, setDepositAmount] = useState("");
  const [depositStatus, setDepositStatus] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  // --- WITHDRAWAL STATE ---
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawStatus, setWithdrawStatus] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // --- 1. TRANSFER FUNCTION ---
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransferring(true);
    setTransferStatus("Processing...");
    try {
      const token = localStorage.getItem('bank_auth_token');
      const response = await fetch(`http://localhost:8080/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token || "" },
        body: JSON.stringify({ recieverId: parseInt(recipientId), amount: parseFloat(transferAmount) })
      });
      if (response.ok) {
        setTransferStatus("✅ Transfer successful!");
        setRecipientId(""); setTransferAmount("");
        fetchDashboardData();
        // If you have a function to fetch user data, call it here to update their balance!
      } else {
        const errorText = await response.text();
        setTransferStatus(`❌ Failed: ${errorText || "Insufficient funds."}`);
      }
    } catch (err) {
      setTransferStatus("❌ Network error.");
    } finally { setIsTransferring(false); }
  };

  // --- 2. DEPOSIT FUNCTION ---
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDepositing(true);
    setDepositStatus("Processing...");
    try {
      const token = localStorage.getItem('bank_auth_token');
      const response = await fetch(`http://localhost:8080/transaction/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token || "" },
        body: JSON.stringify({ amount: parseFloat(depositAmount) })
      });
      if (response.ok) {
        setDepositStatus("✅ Deposit successful!");
        setDepositAmount("");
        fetchDashboardData();
      } else {
        setDepositStatus("❌ Deposit failed.");
      }
    } catch (err) {
      setDepositStatus("❌ Network error.");
    } finally { setIsDepositing(false); }
  };

  // --- 3. WITHDRAWAL FUNCTION ---
  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWithdrawing(true);
    setWithdrawStatus("Processing...");
    try {
      const token = localStorage.getItem('bank_auth_token');
      const response = await fetch(`http://localhost:8080/transaction/withdrawal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token || "" },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount) })
      });
      if (response.ok) {
        setWithdrawStatus("✅ Withdrawal successful!");
        setWithdrawAmount("");
        fetchDashboardData();
      } else {
        setWithdrawStatus("❌ Failed. Insufficient funds?");
      }
    } catch (err) {
      setWithdrawStatus("❌ Network error.");
    } finally { setIsWithdrawing(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {userName}</p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Available funds</p>
          </CardContent>
        </Card>

        

        <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Account Number</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-mono">{accountNumber}</div>
            <p className="text-xs text-muted-foreground mt-1">Primary Checking Account</p>
          </CardContent>
        </Card>
      </div>
      {/* USER TRANSACTION CONTROLS */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        
        {/* 1. SEND MONEY CARD */}
        <Card className="bg-card/80 border-primary/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-500" />
              Send Money
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransfer} className="space-y-4">
              <Input
                type="number" placeholder="Recipient Account ID" required
                value={recipientId} onChange={(e) => setRecipientId(e.target.value)}
                className="bg-secondary/50 focus:border-blue-500"
              />
              <Input
                type="number" step="0.01" placeholder="Amount ($)" required
                value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)}
                className="bg-secondary/50 focus:border-blue-500"
              />
              {transferStatus && <p className={`text-sm ${transferStatus.includes('✅') ? 'text-green-500' : 'text-red-500'}`}>{transferStatus}</p>}
              <Button type="submit" disabled={isTransferring || !recipientId || !transferAmount} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {isTransferring ? "Processing..." : "Transfer"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 2. DEPOSIT CARD */}
        <Card className="bg-card/80 border-primary/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Deposit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDeposit} className="space-y-4">
              <Input
                type="number" step="0.01" placeholder="Amount ($)" required
                value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-secondary/50 focus:border-green-500"
              />
              {depositStatus && <p className={`text-sm ${depositStatus.includes('✅') ? 'text-green-500' : 'text-red-500'}`}>{depositStatus}</p>}
              <Button type="submit" disabled={isDepositing || !depositAmount} className="w-full bg-green-600 hover:bg-green-700 text-white">
                {isDepositing ? "Processing..." : "Deposit"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 3. WITHDRAW CARD */}
        <Card className="bg-card/80 border-primary/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-500" />
              Withdraw
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdrawal} className="space-y-4">
              <Input
                type="number" step="0.01" placeholder="Amount ($)" required
                value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-secondary/50 focus:border-orange-500"
              />
              {withdrawStatus && <p className={`text-sm ${withdrawStatus.includes('✅') ? 'text-green-500' : 'text-red-500'}`}>{withdrawStatus}</p>}
              <Button type="submit" disabled={isWithdrawing || !withdrawAmount} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                {isWithdrawing ? "Processing..." : "Withdraw"}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>=

      {/* Recent Transactions */}
      <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sender Account</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Receiver Account</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Transaction Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => {
                  // Safely check if receiver account matches the logged-in user's account
                  // Uses ?. just in case it's an object, or falls back to string
                  const receiverNo = tx.receiverAccount?.accno || tx.receiverAccount;
                  
                  // 2. Safely grab the transaction type (using your capital 'T'!)
                  const rawType = tx.TransactionType || tx.transactionType || "Transfer";
                  const isWithdrawal = rawType.toUpperCase() === "WITHDRAWAL";

                  // 3. THE FIX: It is only a credit if you received it AND it is not a withdrawal!
                  const isCredit = (receiverNo === accountNumber) && !isWithdrawal;
                  console.log("Raw Transaction from Spring Boot:", tx);
                  
                  
                  


                  return (
                    // FIX 1: Use index as a backup key if tx.id or tx.transId is missing!
                    <tr key={tx.transactionId || tx.id || index} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-foreground">{tx.transactionId || tx.id || index}</span>
                      </td>
                      <td className="py-3 px-4">
                        {/* FIX 2: Safely dig into the object to grab just the accno string! */}
                        <span className="text-sm font-mono text-muted-foreground">{tx.senderAccount?.accno || tx.senderAccount || "N/A"}</span>
                      </td>
                      <td className="py-3 px-4">
                        {/* FIX 2: Safely dig into the object to grab just the accno string! */}
                        <span className="text-sm font-mono text-muted-foreground">{tx.receiverAccount?.accno || tx.receiverAccount || "N/A"}</span>
                      </td>
                      <td className="py-3 px-4">
                        {(() => {
                          // 1. Grab your exact exact variable name!
                          const rawType = tx.TransactionType || tx.transactionType || "Transfer";
                          
                          // 2. Make it uppercase so our color checks never fail
                          const checkType = rawType.toUpperCase();
                          
                          // 3. Format it beautifully for the screen (First letter capital, rest lowercase)
                          const displayType = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();

                          return (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              checkType === "DEPOSIT" 
                                ? "bg-green-500/10 text-green-500" 
                                : checkType === "WITHDRAWAL"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-blue-500/10 text-blue-500"
                            }`}>
                              {displayType}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4">
                        {/* Fallback for Java date variable names */}
                        <span className="text-sm text-muted-foreground">{tx.madeAT || tx.date || "Just now"}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {/* Using tx.transAmount like we fixed earlier! */}
                        <span className={`text-sm font-semibold ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                          {isCredit ? '+' : '-'}${(tx.transAmount || 0).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
