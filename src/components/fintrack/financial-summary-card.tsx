
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/contexts/transactions-context';
import { useMemo } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

export function FinancialSummaryCard({ transactions, prevMonthTransactions }: { transactions: Transaction[], prevMonthTransactions: Transaction[] }) {

  const { income, expense, savings } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const savings = income - expense;
    
    return { income, expense, savings };
  }, [transactions]);
  
  const { incomeChange, expenseChange, savingsChange } = useMemo(() => {
    const prevIncome = prevMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
    
    const prevExpense = prevMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const prevSavings = prevIncome - prevExpense;

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) {
            return current > 0 ? 100 : (current < 0 ? -100 : 0);
        }
        if (previous < 0) {
            // Invert logic for negative previous values to show correct trend direction
             return ((current - previous) / Math.abs(previous)) * 100;
        }
        return ((current - previous) / previous) * 100;
    };

    const incomeChange = calculateChange(income, prevIncome);
    const expenseChange = calculateChange(expense, prevExpense);
    const savingsChange = calculateChange(savings, prevSavings);
    
    return { incomeChange, expenseChange, savingsChange };

  }, [transactions, prevMonthTransactions, income, expense, savings]);


  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-base font-medium">Financial Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Income</p>
            <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-green-600">${income.toFixed(2)}</p>
                {incomeChange !== 0 && (
                   <span className={`flex items-center text-xs font-semibold ${incomeChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                       {incomeChange >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                       {Math.abs(incomeChange).toFixed(1)}%
                   </span>
                )}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Expense</p>
            <div className="flex items-center gap-2">
                 <p className="text-lg font-bold text-red-600">${expense.toFixed(2)}</p>
                 {expenseChange !== 0 && (
                    <span className={`flex items-center text-xs font-semibold ${expenseChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {expenseChange > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {Math.abs(expenseChange).toFixed(1)}%
                    </span>
                 )}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Savings</p>
             <div className="flex items-center gap-2">
                <p className={`text-lg font-bold ${savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>${savings.toFixed(2)}</p>
                {savingsChange !== 0 && (
                    <span className={`flex items-center text-xs font-semibold ${savingsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {savingsChange >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {Math.abs(savingsChange).toFixed(1)}%
                    </span>
                )}
            </div>
          </div>
           <div>
            <p className="text-sm text-muted-foreground">Investments</p>
            <p className="text-lg font-bold text-purple-600">$0.00</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
