
"use client";

import { useTransactions } from '@/contexts/transactions-context';
import { useMemo } from 'react';
import { StatCard } from './stat-card';

export function SavingRateCard() {
  const { currentMonthTransactions } = useTransactions();

  const savingRate = useMemo(() => {
    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    // Correctly define expenses to exclude investments
    const expense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    if (income === 0) return 0;
    
    const savings = income - expense;
    // Ensure savings rate doesn't go below 0 for the display
    return Math.max(0, Math.round((savings / income) * 100));
  }, [currentMonthTransactions]);

  return (
    <StatCard
      label="Savings Rate"
      value={`${savingRate}%`}
      valueClassName="text-blue-600"
    />
  );
}
