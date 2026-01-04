
"use client";

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/contexts/transactions-context';
import { FinTrackLayout } from '@/components/fintrack/fintrack-layout';
import { FinancialSummaryCard } from '@/components/fintrack/financial-summary-card';
import { NeedVsWantChart } from '@/components/fintrack/need-vs-want-chart';
import { ReportCategoryBreakdown } from '@/components/fintrack/report-category-breakdown';
import { BudgetBreakdownCard } from '@/components/fintrack/budget-breakdown-card';
import { isSameMonth, isSameYear } from 'date-fns';
import { Transaction } from '@/contexts/transactions-context';

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

  const filteredTransactions: Transaction[] = React.useMemo(() => {
    const monthIndex = months.indexOf(selectedMonth);
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isSameMonth(transactionDate, new Date(selectedYear, monthIndex)) && isSameYear(transactionDate, new Date(selectedYear, monthIndex));
    });
  }, [transactions, selectedMonth, selectedYear]);


  return (
    <FinTrackLayout>
        <header className="flex items-center pt-2">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/">
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

        {filteredTransactions.length > 0 ? (
          <>
            <FinancialSummaryCard transactions={filteredTransactions} />
            <NeedVsWantChart transactions={filteredTransactions} />
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
