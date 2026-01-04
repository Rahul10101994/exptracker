
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTransactions } from '@/contexts/transactions-context';
import { useBudget } from '@/contexts/budget-context';
import { useMemo } from 'react';

export function BudgetCard() {
  const { currentMonthTransactions } = useTransactions();
  const { budgets } = useBudget();

  const { utilized, totalBudget } = useMemo(() => {
    const utilized = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalBudget = Object.values(budgets).reduce((acc, budget) => acc + budget.amount, 0);

    return { utilized, totalBudget };
  }, [currentMonthTransactions, budgets]);


  const progress = totalBudget > 0 ? (utilized / totalBudget) * 100 : 0;

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="p-2">
        <CardTitle>Monthly Budget</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Progress value={progress} className="h-2 bg-primary/20" />
        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
          <span>Utilized: ${utilized.toFixed(2)}</span>
          <span>Total: ${totalBudget.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
