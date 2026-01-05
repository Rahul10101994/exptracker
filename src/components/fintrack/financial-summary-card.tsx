
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
  
  const { expenseChange } = useMemo(() => {
    const prevExpense = prevMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    if (prevExpense === 0) {
      return { expenseChange: expense > 0 ? 100 : 0 };
    }
    
    const change = ((expense - prevExpense) / prevExpense) * 100;
    return { expenseChange: change };

  }, [transactions, prevMonthTransactions]);


  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-base font-medium">Financial Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Income</p>
            <p className="text-lg font-bold text-green-600">${income.toFixed(2)}</p>
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
            <p className={`text-lg font-bold ${savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>${savings.toFixed(2)}</p>
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
