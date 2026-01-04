
"use client";

import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { useTransactions } from '@/contexts/transactions-context';
import { useMemo } from 'react';

export function BalanceCard() {
  const { currentMonthTransactions } = useTransactions();
  const currentDate = format(new Date(), 'MMMM yyyy');

  const { totalBalance, income, expense } = useMemo(() => {
    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalBalance = income - expense;
    return { totalBalance, income, expense };
  }, [currentMonthTransactions]);

  return (
    <Card className="bg-accent border-0 shadow-lg">
      <CardContent className="p-3">
        <div className="flex items-center justify-between text-accent-foreground/80">
          <p>Total Balance</p>
          <p className="text-sm font-medium">{currentDate}</p>
        </div>
        <p className="text-2xl font-bold text-accent-foreground mt-1">${totalBalance.toFixed(2)}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/30 p-1">
                <ArrowDown className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-accent-foreground/80">Income</p>
              <p className="font-semibold text-accent-foreground">${income.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/30 p-1">
                <ArrowUp className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-accent-foreground/80">Expense</p>              
              <p className="font-semibold text-accent-foreground">${expense.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
