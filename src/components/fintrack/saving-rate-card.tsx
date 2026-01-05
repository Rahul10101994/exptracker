
"use client";

import { PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/transactions-context';
import { useMemo } from 'react';

export function SavingRateCard() {
  const { currentMonthTransactions } = useTransactions();

  const savingRate = useMemo(() => {
    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    if (income === 0) return 0;
    
    const savings = income - expense;
    return Math.max(0, Math.round((savings / income) * 100));
  }, [currentMonthTransactions]);

  return (
    <Card className="border-0 shadow-lg w-full h-24">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm sm:text-base font-medium">My Saving</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-1">
        <p className="text-xl sm:text-2xl font-bold text-blue-600">{savingRate}%</p>
        <p className="text-xs sm:text-sm text-muted-foreground">Savings rate</p>
      </CardContent>
    </Card>
  );
}
