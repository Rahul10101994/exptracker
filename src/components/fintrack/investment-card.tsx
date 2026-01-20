
"use client";

import { useBudget } from "@/contexts/budget-context";
import { useTransactions } from "@/contexts/transactions-context";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { StatCard } from "./stat-card";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

export function InvestmentCard() {
  const { investmentBudgets } = useBudget();
  const { currentMonthTransactions } = useTransactions();

  const { budgetAmount, spent, progress } = useMemo(() => {
    const budget = Object.values(investmentBudgets).reduce((sum, b) => sum + b.amount, 0);
    
    const investmentSpent = currentMonthTransactions
      .filter(t => t.type === 'investment')
      .reduce((sum, t) => sum + t.amount, 0);

    const progressPercentage = budget > 0 ? (investmentSpent / budget) * 100 : 0;

    return {
      budgetAmount: budget,
      spent: investmentSpent,
      progress: progressPercentage
    };
  }, [investmentBudgets, currentMonthTransactions]);


  if (budgetAmount <= 0) {
    return (
        <StatCard
            label="Investment Budget"
            value="Not Set"
            valueClassName="text-muted-foreground"
        />
    );
  }

  const isAchieved = progress >= 100;

  return (
    <Card className="border-0 shadow-lg w-full h-20">
        <CardContent className="flex flex-col justify-center h-full p-3 gap-2">
             <div className="flex justify-between items-baseline">
                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                    Investment Budget
                </p>
                 <p className="text-xs font-semibold text-purple-600">
                    {Math.round(progress)}%
                </p>
            </div>
            <Progress
                value={Math.min(progress, 100)}
                className={cn(
                  "h-2",
                  isAchieved && "[&>div]:bg-green-500",
                  !isAchieved && "[&>div]:bg-purple-500"
                )}
            />
            <div className="flex justify-between items-baseline text-xs text-muted-foreground">
                <span>₹{spent.toFixed(0)}</span>
                <span>₹{budgetAmount.toFixed(0)}</span>
            </div>
        </CardContent>
    </Card>
  );
}
