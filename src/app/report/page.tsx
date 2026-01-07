"use client";

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/contexts/transactions-context';
import { FinTrackLayout } from '@/components/fintrack/fintrack-layout';
import { FinancialSummaryCard } from '@/components/fintrack/financial-summary-card';
import { ReportCategoryBreakdown } from '@/components/fintrack/report-category-breakdown';
import { BudgetBreakdownCard } from '@/components/fintrack/budget-breakdown-card';
import { isSameMonth, isSameYear, subMonths, isWithinInterval, startOfDay, endOfDay, subYears, getYear, sub, differenceInDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { NeedWantBreakdownCard } from '@/components/fintrack/need-want-breakdown-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function ReportPage() {
  const { transactions } = useTransactions();
  const [activeTab, setActiveTab] = React.useState('monthly');

  // Monthly state
  const [selectedMonth, setSelectedMonth] = React.useState<string>(months[new Date().getMonth()]);
  const [selectedYearForMonth, setSelectedYearForMonth] = React.useState<number>(currentYear);

  // Yearly state
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);
  
  // Period state
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(new Date(currentYear, new Date().getMonth(), 1));
  const [dateTo, setDateTo] = React.useState<Date | undefined>(new Date());


  const { filteredTransactions, previousPeriodTransactions, periodFrom, periodTo } = React.useMemo(() => {
    let filtered: typeof transactions = [];
    let previous: typeof transactions = [];
    let from: Date | undefined;
    let to: Date | undefined;

    switch (activeTab) {
      case 'monthly': {
        const monthIndex = months.indexOf(selectedMonth);
        const selectedDate = new Date(selectedYearForMonth, monthIndex);
        from = startOfMonth(selectedDate);
        to = endOfMonth(selectedDate);
        
        filtered = transactions.filter(t => {
            const tDate = new Date(t.date);
            return isSameMonth(tDate, selectedDate) && isSameYear(tDate, selectedDate);
        });

        const prevMonthDate = subMonths(selectedDate, 1);
        previous = transactions.filter(t => {
            const tDate = new Date(t.date);
            return isSameMonth(tDate, prevMonthDate) && isSameYear(tDate, prevMonthDate);
        });
        break;
      }
      case 'yearly': {
        const selectedDate = new Date(selectedYear, 0, 1);
        from = startOfYear(selectedDate);
        to = endOfYear(selectedDate);

        filtered = transactions.filter(t => getYear(new Date(t.date)) === selectedYear);
        
        const prevYearDate = subYears(new Date(selectedYear, 0, 1), 1);
        previous = transactions.filter(t => getYear(new Date(t.date)) === getYear(prevYearDate));
        break;
      }
      case 'period': {
        if (dateFrom && dateTo) {
            from = startOfDay(dateFrom);
            to = endOfDay(dateTo);
            filtered = transactions.filter(t => isWithinInterval(new Date(t.date), { start: from, end: to }));
        
            const duration = differenceInDays(to, from);
            const prevPeriodStart = sub(from, { days: duration + 1 });
            const prevPeriodEnd = sub(to, { days: duration + 1 });

            previous = transactions.filter(t => isWithinInterval(new Date(t.date), { start: prevPeriodStart, end: prevPeriodEnd }));
        }
        break;
      }
    }
    
    return { 
        filteredTransactions: filtered, 
        previousPeriodTransactions: previous,
        periodFrom: from?.toISOString(),
        periodTo: to?.toISOString()
    };

  }, [transactions, activeTab, selectedMonth, selectedYearForMonth, selectedYear, dateFrom, dateTo]);


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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
            <TabsTrigger value="period">Period</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly" className="space-y-4">
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
          <TabsContent value="yearly" className="space-y-4">
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
          <TabsContent value="period" className="space-y-4">
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
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus/></PopoverContent>
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
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus/></PopoverContent>
                  </Popover>
              </div>
          </TabsContent>
        </Tabs>


        {filteredTransactions.length > 0 || previousPeriodTransactions.length > 0 ? (
          <div className="space-y-4">
            <FinancialSummaryCard 
                transactions={filteredTransactions} 
                prevMonthTransactions={previousPeriodTransactions}
                from={periodFrom}
                to={periodTo}
            />
            <NeedWantBreakdownCard transactions={filteredTransactions} prevMonthTransactions={previousPeriodTransactions} />
            <ReportCategoryBreakdown transactions={filteredTransactions} />
            <BudgetBreakdownCard transactions={filteredTransactions} />
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            No transactions for this period.
          </div>
        )}
    </FinTrackLayout>
  );
}
