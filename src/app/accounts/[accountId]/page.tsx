"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, Calendar as CalendarIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  isSameMonth,
  isSameYear,
  getYear,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

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
  
  // New state for period selection
  const [activeTab, setActiveTab] = React.useState('monthly');
  const [selectedMonth, setSelectedMonth] = React.useState<string>(months[new Date().getMonth()]);
  const [selectedYearForMonth, setSelectedYearForMonth] = React.useState<number>(currentYear);
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = React.useState<Date | undefined>(endOfMonth(new Date()));

  const account = React.useMemo(() => {
    return accounts.find(a => a.id === accountId);
  }, [accounts, accountId]);

  const accountTransactions = React.useMemo(() => {
    if (!account) return [];
    
    // Filter transactions related to this account
    const allAccountTransactions = transactions.filter(t => 
      (t.type !== 'transfer' && t.account?.toLowerCase() === account.name.toLowerCase()) ||
      (t.type === 'transfer' && (t.fromAccount?.toLowerCase() === account.name.toLowerCase() || t.toAccount?.toLowerCase() === account.name.toLowerCase()))
    );

    let filtered: typeof transactions = [];

    switch (activeTab) {
      case 'monthly': {
        const monthIndex = months.indexOf(selectedMonth);
        const selectedDate = new Date(selectedYearForMonth, monthIndex);
        filtered = allAccountTransactions.filter(t => {
            const tDate = new Date(t.date);
            return isSameMonth(tDate, selectedDate) && isSameYear(tDate, selectedDate);
        });
        break;
      }
      case 'yearly': {
        filtered = allAccountTransactions.filter(t => getYear(new Date(t.date)) === selectedYear);
        break;
      }
      case 'period': {
        if (dateFrom && dateTo) {
            const from = startOfDay(dateFrom);
            const to = endOfDay(dateTo);
            filtered = allAccountTransactions.filter(t => isWithinInterval(new Date(t.date), { start: from, end: to }));
        }
        break;
      }
    }
    return filtered;
  }, [transactions, account, activeTab, selectedMonth, selectedYearForMonth, selectedYear, dateFrom, dateTo]);
  
  const statementData = React.useMemo(() => {
    if (!account) return [];
    
    const chronologicalTransactions = [...accountTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const periodStartDate = (() => {
        switch (activeTab) {
            case 'monthly':
                return startOfMonth(new Date(selectedYearForMonth, months.indexOf(selectedMonth)));
            case 'yearly':
                return startOfYear(new Date(selectedYear, 0, 1));
            case 'period':
                return dateFrom ? startOfDay(dateFrom) : new Date();
            default:
                return new Date();
        }
    })();

    const transactionsBeforePeriod = transactions.filter(t => {
        const tDate = new Date(t.date);
        const isForThisAccount = (t.type !== 'transfer' && t.account?.toLowerCase() === account.name.toLowerCase()) || (t.type === 'transfer' && (t.fromAccount?.toLowerCase() === account.name.toLowerCase() || t.toAccount?.toLowerCase() === account.name.toLowerCase()));
        return isForThisAccount && tDate < periodStartDate;
    });

    const startingBalance = transactionsBeforePeriod.reduce((acc, t) => {
        let amountChange = 0;
        if (t.type === 'income') amountChange = t.amount;
        else if (t.type === 'expense' || t.type === 'investment') amountChange = -t.amount;
        else if (t.type === 'transfer') {
            if (t.toAccount?.toLowerCase() === account.name.toLowerCase()) amountChange = t.amount;
            else if (t.fromAccount?.toLowerCase() === account.name.toLowerCase()) amountChange = -t.amount;
        }
        return acc + amountChange;
    }, account.initialBalance);

    let runningBalance = startingBalance;
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
  }, [account, accountTransactions, transactions, activeTab, selectedMonth, selectedYearForMonth, selectedYear, dateFrom, dateTo]);
  
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

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly</TabsTrigger>
                    <TabsTrigger value="period">Period</TabsTrigger>
                </TabsList>
                <TabsContent value="monthly" className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger>
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map(month => (
                                    <SelectItem key={month} value={month}>{month}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedYearForMonth.toString()} onValueChange={(value) => setSelectedYearForMonth(parseInt(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(year => (
                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </TabsContent>
                <TabsContent value="yearly" className="space-y-4 pt-2">
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </TabsContent>
                <TabsContent value="period" className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateFrom ? format(dateFrom, "PPP") : <span>Pick a start date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus /></PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateTo ? format(dateTo, "PPP") : <span>Pick an end date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                </TabsContent>
            </Tabs>

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
                                        No transactions for this period.
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
