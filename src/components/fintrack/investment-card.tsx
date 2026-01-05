
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/contexts/transactions-context';
import { useMemo } from 'react';

export function InvestmentCard() {
  const { currentMonthTransactions } = useTransactions();

  const { totalInvestment, investmentCount } = useMemo(() => {
    const investmentTransactions = currentMonthTransactions.filter(
      (t) => t.category.toLowerCase() === 'investment'
    );
    const total = investmentTransactions.reduce((acc, t) => acc + t.amount, 0);
    const count = investmentTransactions.length;
    return { totalInvestment: total, investmentCount: count };
  }, [currentMonthTransactions]);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="p-2 pb-0">
        <CardTitle className="text-base font-medium">Investments</CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <p className="text-xl font-bold">${totalInvestment.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground">{investmentCount} active this month</p>
      </CardContent>
    </Card>
  );
}
