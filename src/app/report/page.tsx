
"use client";

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/contexts/transactions-context';
import { FinTrackLayout } from '@/components/fintrack/fintrack-layout';
import { FinancialSummaryCard } from '@/components/fintrack/financial-summary-card';
import { ReportCategoryBreakdown } from '@/components/fintrack/report-category-breakdown';
import { BudgetBreakdownCard } from '@/components/fintrack/budget-breakdown-card';
import { isSameMonth, isSameYear, subMonths } from 'date-fns';
import { NeedWantBreakdownCard } from '@/components/fintrack/need-want-breakdown-card';

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);


export default function ReportPage() {
  const { transactions } = useTransactions();
  const [selectedMonth, setSelectedMonth] = React.useState<string>(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);

  const { filteredTransactions, previousMonthTransactions } = React.useMemo(() => {
    const monthIndex = months.indexOf(selectedMonth);
    const selectedDate = new Date(selectedYear, monthIndex);

    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isSameMonth(transactionDate, selectedDate) && isSameYear(transactionDate, selectedDate);
    });

    const prevMonthDate = subMonths(selectedDate, 1);
    const previousMonthFiltered = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return isSameMonth(transactionDate, prevMonthDate) && isSameYear(transactionDate, prevMonthDate);
    });
    
    return { filteredTransactions: filtered, previousMonthTransactions: previousMonthFiltered };

  }, [transactions, selectedMonth, selectedYear]);


  return (
    <FinTrackLayout>
        <header className="flex items-center pt-2">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                    <ArrowLeft />
                    <span className="sr-only">Back</span>
                </Link>
            </Button>
            <h1 className="text-lg font-bold text-foreground mx-auto">Financial Report</h1>
            <div className="w-10"></div>
        </header>

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
        </div>

        {filteredTransactions.length > 0 || previousMonthTransactions.length > 0 ? (
          <>
            <FinancialSummaryCard transactions={filteredTransactions} prevMonthTransactions={previousMonthTransactions} />
            <NeedWantBreakdownCard transactions={filteredTransactions} prevMonthTransactions={previousMonthTransactions} />
            <ReportCategoryBreakdown transactions={filteredTransactions} />
            <BudgetBreakdownCard transactions={filteredTransactions} />
          </>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            No transactions for this period.
          </div>
        )}
    </FinTrackLayout>
  );
}
