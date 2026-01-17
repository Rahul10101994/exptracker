
"use client";

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useTransactions } from '@/contexts/transactions-context';
import { useAccounts } from '@/contexts/account-context';
import { isSameMonth, isSameYear, getYear, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface GenerateAccountSummaryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    accountId: string;
}

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export function GenerateAccountSummaryDialog({ isOpen, onClose, accountId }: GenerateAccountSummaryDialogProps) {
    const { transactions } = useTransactions();
    const { accounts } = useAccounts();
    const [activeTab, setActiveTab] = React.useState('monthly');

    // Monthly state
    const [selectedMonth, setSelectedMonth] = React.useState<string>(months[new Date().getMonth()]);
    const [selectedYearForMonth, setSelectedYearForMonth] = React.useState<number>(currentYear);

    // Yearly state
    const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);
    
    // Period state
    const [dateFrom, setDateFrom] = React.useState<Date | undefined>(startOfMonth(new Date()));
    const [dateTo, setDateTo] = React.useState<Date | undefined>(endOfMonth(new Date()));

    const account = React.useMemo(() => accounts.find(a => a.id === accountId), [accounts, accountId]);

    const { periodTransactions, summaryTitle } = React.useMemo(() => {
        if (!account) return { periodTransactions: [], summaryTitle: '' };
        
        let filtered: typeof transactions = [];
        let title = '';

        const accountTransactions = transactions.filter(t => 
            (t.type !== 'transfer' && t.account?.toLowerCase() === account.name.toLowerCase()) ||
            (t.type === 'transfer' && (t.fromAccount?.toLowerCase() === account.name.toLowerCase() || t.toAccount?.toLowerCase() === account.name.toLowerCase()))
        );

        switch (activeTab) {
            case 'monthly': {
                const monthIndex = months.indexOf(selectedMonth);
                const selectedDate = new Date(selectedYearForMonth, monthIndex);
                title = `Summary for ${selectedMonth} ${selectedYearForMonth}`;
                filtered = accountTransactions.filter(t => {
                    const tDate = new Date(t.date);
                    return isSameMonth(tDate, selectedDate) && isSameYear(tDate, selectedDate);
                });
                break;
            }
            case 'yearly': {
                title = `Summary for ${selectedYear}`;
                filtered = accountTransactions.filter(t => getYear(new Date(t.date)) === selectedYear);
                break;
            }
            case 'period': {
                if (dateFrom && dateTo) {
                    title = `Summary for ${format(dateFrom, 'PPP')} to ${format(dateTo, 'PPP')}`;
                    const from = startOfDay(dateFrom);
                    const to = endOfDay(dateTo);
                    filtered = accountTransactions.filter(t => isWithinInterval(new Date(t.date), { start: from, end: to }));
                }
                break;
            }
        }
        return { periodTransactions: filtered, summaryTitle: title };

    }, [transactions, account, activeTab, selectedMonth, selectedYearForMonth, selectedYear, dateFrom, dateTo]);

    const { income, expense, netFlow } = React.useMemo(() => {
        if (!account) return { income: 0, expense: 0, netFlow: 0 };
        
        let income = 0;
        let expense = 0;

        periodTransactions.forEach(t => {
            if (t.type === 'income') {
                income += t.amount;
            } else if (t.type === 'expense' || t.type === 'investment') {
                expense += t.amount;
            } else if (t.type === 'transfer') {
                if (t.toAccount?.toLowerCase() === account.name.toLowerCase()) {
                    income += t.amount;
                }
                if (t.fromAccount?.toLowerCase() === account.name.toLowerCase()) {
                    expense += t.amount;
                }
            }
        });

        return { income, expense, netFlow: income - expense };
    }, [periodTransactions, account]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-[95vw]">
                <DialogHeader>
                    <DialogTitle>Generate Account Summary</DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        <TabsTrigger value="yearly">Yearly</TabsTrigger>
                        <TabsTrigger value="period">Period</TabsTrigger>
                    </TabsList>
                    <TabsContent value="monthly" className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                                <SelectContent>
                                    {months.map(month => (
                                        <SelectItem key={month} value={month}>{month}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedYearForMonth.toString()} onValueChange={(value) => setSelectedYearForMonth(parseInt(value))}>
                                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
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
                            <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
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
                                    <Button variant={"outline"} className={cn("justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateFrom ? format(dateFrom, "PPP") : <span>Pick a start date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus /></PopoverContent>
                            </Popover>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateTo ? format(dateTo, "PPP") : <span>Pick an end date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus /></PopoverContent>
                            </Popover>
                        </div>
                    </TabsContent>
                </Tabs>
                
                {periodTransactions.length > 0 ? (
                    <Card>
                        <DialogHeader className="p-4 pb-2">
                            <DialogTitle className="text-base">{summaryTitle}</DialogTitle>
                        </DialogHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Inflow:</span>
                                <span className="font-semibold text-green-600">₹{income.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Outflow:</span>
                                <span className="font-semibold text-red-600">₹{expense.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="font-semibold">Net Flow:</span>
                                <span className={cn("font-bold", netFlow >= 0 ? "text-green-700" : "text-red-700")}>₹{netFlow.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="text-center text-sm text-muted-foreground py-10">
                        No transactions for this period.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
