
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useBudget } from "@/contexts/budget-context";
import { Transaction } from "@/contexts/transactions-context";
import { useMemo } from "react";

export function BudgetBreakdownCard({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { expenseBudgets, investmentBudgets } = useBudget();

  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense" || t.type === "investment")
      .forEach((t) => {
        spending[t.category.toLowerCase()] = (spending[t.category.toLowerCase()] || 0) + t.amount;
      });
    return spending;
  }, [transactions]);

  const { budgetBreakdown, totalBudget, totalSpent } = useMemo(() => {
    const allBudgets = { ...expenseBudgets, ...investmentBudgets };

    const breakdown = Object.entries(allBudgets).map(([category, budget]) => {
      const isInvestment = category in investmentBudgets;
      const budgetAmount = budget.amount;
      const spent = categorySpending[category.toLowerCase()] || 0;
      const progress =
        budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
      
      let status: "safe" | "warning" | "over" | "achieved" = "safe";
      if (isInvestment) {
          if (progress >= 100) status = "achieved";
      } else {
          if (progress > 100) status = "over";
          else if (progress >= 90) status = "warning";
      }

      return {
        category,
        spent,
        budgetAmount,
        progress,
        status,
        isInvestment,
      };
    });

    const totalExpenseBudget = Object.values(expenseBudgets).reduce((sum, b) => sum + b.amount, 0);
    const totalInvestmentBudget = Object.values(investmentBudgets).reduce((sum, b) => sum + b.amount, 0);
    const totalBudget = totalExpenseBudget + totalInvestmentBudget;

    const totalSpent = Object.values(categorySpending).reduce(
      (sum, s) => sum + s,
      0
    );

    return { budgetBreakdown: breakdown.sort((a,b) => b.spent - a.spent), totalBudget, totalSpent };
  }, [expenseBudgets, investmentBudgets, categorySpending]);

  const remainingBudget = totalBudget - totalSpent;

  const getBadge = (status: "safe" | "warning" | "over" | "achieved") => {
    switch (status) {
      case "warning":
        return (
          <Badge variant="secondary" className="text-yellow-600">
            Warning
          </Badge>
        );
      case "over":
        return (
          <Badge variant="destructive">
            Over
          </Badge>
        );
       case "achieved":
        return (
          <Badge variant="outline" className="text-green-600">
            Achieved
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            On Track
          </Badge>
        );
    }
  };

  const getProgressColor = (status: "safe" | "warning" | "over" | "achieved", isInvestment: boolean) => {
    if (isInvestment) {
        return status === "achieved" ? "[&>div]:bg-green-500" : "[&>div]:bg-purple-500";
    }
    // Is expense
    if (status === "over") return "[&>div]:bg-destructive";
    if (status === "warning") return "[&>div]:bg-yellow-500";
    return "[&>div]:bg-primary";
  };


  return (
    <Card className="border-0 shadow-lg w-full">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm sm:text-base font-medium">
          Budget Breakdown
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-5">
        {/* Totals */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Total Budget
            </p>
            <p className="text-lg sm:text-xl font-bold truncate">
              ₹{totalBudget.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Remaining
            </p>
            <p
              className={`text-lg sm:text-xl font-bold truncate ${
                remainingBudget < 0 ? "text-destructive" : ""
              }`}
            >
              ₹{remainingBudget.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          {budgetBreakdown.map(
            ({ category, spent, budgetAmount, progress, status, isInvestment }) => {
              if (budgetAmount <= 0) return null;

              return (
              <div key={category}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium capitalize truncate">
                      {category}
                    </span>
                    {getBadge(status)}
                  </div>

                  <span
                    className={`text-xs sm:text-sm whitespace-nowrap ${
                      status === "over"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    ₹{spent.toFixed(0)} / ₹{budgetAmount.toFixed(0)}
                  </span>
                </div>

                {/* Animated Progress */}
                <Progress
                  value={progress}
                  className={`h-2 transition-all duration-700 ease-out ${getProgressColor(status, isInvestment)}`}
                />
              </div>
            )}
          )}

          {budgetBreakdown.filter(b => b.budgetAmount > 0).length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">
              No budgets set.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
