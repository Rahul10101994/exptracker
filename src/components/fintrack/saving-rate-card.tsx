
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
    <Card className="shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between p-2 pb-0">
        <CardTitle className="text-base font-medium">My Saving</CardTitle>
        <PieChart className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <p className="text-xl font-bold">{savingRate}%</p>
        <p className="text-xs text-muted-foreground">Savings rate</p>
      </CardContent>
    </Card>
  );
}
