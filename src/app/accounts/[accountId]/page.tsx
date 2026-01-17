
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { useAccounts } from "@/contexts/account-context";
import { useTransactions, Transaction } from "@/contexts/transactions-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { GenerateAccountSummaryDialog } from "@/components/fintrack/generate-account-summary-dialog";

function AccountSummarySkeleton() {
    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="flex items-center justify-between p-4 pt-6 border-b">
                <Skeleton className="h-10 w-10" />
                <div className="text-center">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="w-10" />
            </header>
            <main className="p-4 space-y-4">
                <Skeleton className="h-24 w-full" />
                <div className="space-y-4 pt-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-16" />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}


export default function AccountSummaryPage() {
  const params = useParams();
  const accountId = params.accountId as string;

  const { accounts, getAccountBalance } = useAccounts();
  const { transactions, getIconForCategory } = useTransactions();

  const [isClient, setIsClient] = React.useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = React.useState(false);
  
  React.useEffect(() => { setIsClient(true) }, []);

  const account = React.useMemo(() => {
    return accounts.find(a => a.id === accountId);
  }, [accounts, accountId]);

  const accountTransactions = React.useMemo(() => {
    if (!account) return [];
    
    // Filter transactions related to this account
    return transactions.filter(t => 
      (t.type !== 'transfer' && t.account?.toLowerCase() === account.name.toLowerCase()) ||
      (t.type === 'transfer' && (t.fromAccount?.toLowerCase() === account.name.toLowerCase() || t.toAccount?.toLowerCase() === account.name.toLowerCase()))
    );

  }, [transactions, account]);
  
  const currentBalance = account ? getAccountBalance(accountId) : 0;

  if (!isClient || !account) {
    return <AccountSummarySkeleton />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
        <header className="flex items-center p-2 pt-4 border-b">
            <Button variant="ghost" size="icon" asChild>
            <Link href="/accounts">
                <ArrowLeft />
                <span className="sr-only">Back</span>
            </Link>
            </Button>
            <div className="mx-auto text-center">
                <h1 className="text-lg font-bold capitalize">{account.name}</h1>
                <p className="text-xs text-muted-foreground">Account Summary</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsSummaryDialogOpen(true)}>
                <FileText />
                <span className="sr-only">Generate Summary</span>
            </Button>
        </header>

        <main className="p-4 space-y-4">
             <Card className="border-0 shadow-lg bg-accent text-accent-foreground">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-3xl font-bold">₹{currentBalance.toFixed(2)}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     {accountTransactions.length > 0 ? (
                        accountTransactions.map((transaction) => {
                            const Icon = getIconForCategory(transaction.category);
                            const isIncome = transaction.type === "income";
                            const isTransfer = transaction.type === "transfer";
                            let amountPrefix = '-';
                            let amountColor = 'text-red-600';

                            if (isIncome) {
                                amountPrefix = '+';
                                amountColor = 'text-green-600';
                            } else if (isTransfer) {
                                if (transaction.toAccount?.toLowerCase() === account.name.toLowerCase()) {
                                    amountPrefix = '+';
                                    amountColor = 'text-green-600';
                                } else {
                                    amountPrefix = '-';
                                    amountColor = 'text-red-600';
                                }
                            }

                            return (
                                <div
                                key={transaction.id}
                                className="flex items-center justify-between"
                                >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                    className={cn(
                                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                                        transaction.bgColor
                                    )}
                                    >
                                    <Icon
                                        className={cn(
                                        "h-5 w-5",
                                        transaction.fgColor
                                        )}
                                    />
                                    </div>

                                    <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate">
                                        {transaction.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {transaction.category} •{" "}
                                        {new Date(transaction.date).toLocaleDateString(
                                        "en-US",
                                        { day: "numeric", month: "short" }
                                        )}
                                    </p>
                                    </div>
                                </div>
                                <p
                                    className={cn(
                                    "text-sm font-semibold whitespace-nowrap",
                                    amountColor
                                    )}
                                >
                                    {amountPrefix}₹
                                    {transaction.amount.toFixed(0)}
                                </p>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-sm text-muted-foreground py-10">
                            No transactions for this account.
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
        
        <GenerateAccountSummaryDialog 
            isOpen={isSummaryDialogOpen}
            onClose={() => setIsSummaryDialogOpen(false)}
            accountId={accountId}
        />
    </div>
  );
}
