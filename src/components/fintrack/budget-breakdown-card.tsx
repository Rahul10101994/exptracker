
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useBudget } from '@/contexts/budget-context';
import { Transaction } from '@/contexts/transactions-context';
import { useMemo } from 'react';

export function BudgetBreakdownCard({ transactions }: { transactions: Transaction[] }) {
  const { budgets } = useBudget();

  const categorySpending = useMemo(() => {
    const spending: { [category: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (spending[t.category]) {
          spending[t.category] += t.amount;
        } else {
          spending[t.category] = t.amount;
        }
      });
    return spending;
  }, [transactions]);
  
  const budgetBreakdown = useMemo(() => {
    return Object.keys(budgets).map(category => {
      const budgetAmount = budgets[category].amount;
      const spent = categorySpending[category] || 0;
      const progress = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
      return {
        category,
        spent,
        budgetAmount,
        progress
      };
    })
  }, [budgets, categorySpending])

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-base font-medium">Budget Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-4">
        {budgetBreakdown.map(({ category, spent, budgetAmount, progress }) => (
            <div key={category}>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium capitalize">{category}</span>
                    <span className={`text-sm ${progress > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        ${spent.toFixed(2)} / ${budgetAmount.toFixed(2)}
                    </span>
                </div>
                <Progress value={progress} className={`h-2 ${progress > 100 ? '[&>div]:bg-destructive' : ''}`} />
            </div>
        ))}
        {budgetBreakdown.length === 0 && (
             <div className="text-center text-muted-foreground py-10">
                No budgets set.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
