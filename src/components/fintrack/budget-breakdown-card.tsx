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
  const { budgets } = useBudget();

  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      });
    return spending;
  }, [transactions]);

  const { budgetBreakdown, totalBudget, totalSpent } = useMemo(() => {
    const breakdown = Object.keys(budgets).map((category) => {
      const budgetAmount = budgets[category].amount;
      const spent = categorySpending[category] || 0;
      const progress =
        budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      let status: "safe" | "warning" | "over" = "safe";
      if (progress >= 90 && progress <= 100) status = "warning";
      if (progress > 100) status = "over";

      return {
        category,
        spent,
        budgetAmount,
        progress,
        status,
      };
    });

    const totalBudget = Object.values(budgets).reduce(
      (sum, b) => sum + b.amount,
      0
    );
    const totalSpent = Object.values(categorySpending).reduce(
      (sum, s) => sum + s,
      0
    );

    return { budgetBreakdown: breakdown, totalBudget, totalSpent };
  }, [budgets, categorySpending]);

  const remainingBudget = totalBudget - totalSpent;

  const getBadge = (status: "safe" | "warning" | "over") => {
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
      default:
        return (
          <Badge variant="outline" className="text-green-600">
            Safe
          </Badge>
        );
    }
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
            ({ category, spent, budgetAmount, progress, status }) => (
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
                  className={`h-2 transition-all duration-700 ease-out ${
                    status === "over"
                      ? "[&>div]:bg-destructive"
                      : status === "warning"
                      ? "[&>div]:bg-yellow-500"
                      : "[&>div]:bg-green-500"
                  }`}
                />
              </div>
            )
          )}

          {budgetBreakdown.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">
              No budgets set.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
