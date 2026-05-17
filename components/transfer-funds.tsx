"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";

export function TransferFunds() {
  const [recipientAccount, setRecipientAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate transfer
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSuccess(true);
    
    // Reset after showing success
    setTimeout(() => {
      setIsSuccess(false);
      setRecipientAccount("");
      setAmount("");
      setDescription("");
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Transfer Funds</h1>
          <p className="text-muted-foreground mt-1">Send money to other accounts</p>
        </div>

        <Card className="bg-card/80 border-border/50 backdrop-blur-sm max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Transfer Successful!</h3>
              <p className="text-muted-foreground">Your transfer has been processed successfully.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Transfer Funds</h1>
        <p className="text-muted-foreground mt-1">Send money to other accounts</p>
      </div>

      <Card className="bg-card/80 border-border/50 backdrop-blur-sm max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">New Transfer</CardTitle>
          <CardDescription>Enter the recipient details and amount</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-foreground/90">Recipient Account Number</Label>
              <Input
                id="recipient"
                type="text"
                placeholder="Enter account number"
                value={recipientAccount}
                onChange={(e) => setRecipientAccount(e.target.value)}
                className="bg-input border-border/50 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground/90">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-input border-border/50 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground/90">Description (Optional)</Label>
              <Input
                id="description"
                type="text"
                placeholder="What is this transfer for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-input border-border/50 focus:border-primary"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Transfer Funds
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Transfers */}
      <Card className="bg-card/80 border-border/50 backdrop-blur-sm max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Recent Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { to: "****5678", amount: 250.00, date: "2026-05-03" },
              { to: "****9012", amount: 100.00, date: "2026-04-28" },
              { to: "****3456", amount: 500.00, date: "2026-04-20" },
            ].map((transfer, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">To: {transfer.to}</p>
                  <p className="text-xs text-muted-foreground">{transfer.date}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">-${transfer.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
