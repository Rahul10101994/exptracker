
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/contexts/transactions-context';
import { useMemo } from 'react';

export function FinancialSummaryCard({ transactions }: { transactions: Transaction[] }) {

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
            <p className="text-lg font-bold text-red-600">${expense.toFixed(2)}</p>
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
