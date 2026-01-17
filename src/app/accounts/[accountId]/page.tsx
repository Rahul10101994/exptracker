
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><Skeleton className="h-5 w-16" /></TableHead>
                                    <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                    <TableHead className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
                                    <TableHead className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableHead>
                                    <TableHead className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}


export default function AccountSummaryPage() {
  const params = useParams();
  const accountId = params.accountId as string;

  const { accounts, getAccountBalance } = useAccounts();
  const { transactions } = useTransactions();

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
  
  const statementData = React.useMemo(() => {
    if (!account) return [];
    
    const chronologicalTransactions = [...accountTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = account.initialBalance;
    const dataWithBalance = chronologicalTransactions.map(t => {
      let amountChange = 0;
      let debit = 0;
      let credit = 0;
      
      const isTransfer = t.type === 'transfer';
      const isIncome = t.type === 'income';
      const isExpense = t.type === 'expense' || t.type === 'investment';

      if (isIncome) {
        amountChange = t.amount;
        credit = t.amount;
      } else if (isExpense) {
        amountChange = -t.amount;
        debit = t.amount;
      } else if (isTransfer) {
        if (t.toAccount?.toLowerCase() === account.name.toLowerCase()) {
          amountChange = t.amount;
          credit = t.amount;
        } else if (t.fromAccount?.toLowerCase() === account.name.toLowerCase()) {
          amountChange = -t.amount;
          debit = t.amount;
        }
      }
      
      runningBalance += amountChange;
      
      return {
        ...t,
        debit,
        credit,
        runningBalance
      };
    });
    
    return dataWithBalance.reverse();
  }, [account, accountTransactions]);
  
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
                    <CardTitle>Account Statement</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-4">Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                                <TableHead className="text-right pr-4">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {statementData.length > 0 ? (
                                statementData.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="text-xs text-muted-foreground pl-4">
                                          {new Date(tx.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
                                        </TableCell>
                                        <TableCell className="font-medium truncate max-w-24">{tx.name}</TableCell>
                                        <TableCell className="text-right font-semibold text-red-600">
                                            {tx.debit > 0 ? `₹${tx.debit.toFixed(2)}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-green-600">
                                            {tx.credit > 0 ? `₹${tx.credit.toFixed(2)}` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-medium pr-4">
                                          ₹{tx.runningBalance.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No transactions for this account.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
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
