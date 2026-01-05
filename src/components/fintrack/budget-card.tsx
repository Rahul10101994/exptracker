"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTransactions } from "@/contexts/transactions-context";
import { useBudget } from "@/contexts/budget-context";
import { useMemo } from "react";

export function BudgetCard() {
  const { currentMonthTransactions } = useTransactions();
  const { budgets } = useBudget();

  const { utilized, totalBudget } = useMemo(() => {
    const utilized = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    const totalBudget = Object.values(budgets).reduce(
      (acc, budget) => acc + budget.amount,
      0
    );

    return { utilized, totalBudget };
  }, [currentMonthTransactions, budgets]);

  const progress =
    totalBudget > 0 ? (utilized / totalBudget) * 100 : 0;

  /* -------- Status Logic -------- */
  let status: "safe" | "warning" | "over" = "safe";
  if (progress >= 90 && progress <= 100) status = "warning";
  if (progress > 100) status = "over";

  const StatusBadge = () => {
    if (status === "warning")
      return (
        <Badge variant="secondary" className="text-yellow-600">
          Warning
        </Badge>
      );
    if (status === "over")
      return <Badge variant="destructive">Over</Badge>;
    return (
      <Badge variant="outline" className="text-green-600">
        Safe
      </Badge>
    );
  };

  return (
    <Card className="border-0 shadow-lg w-full">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm sm:text-base font-medium">
          Monthly Budget
        </CardTitle>
        <StatusBadge />
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {/* Progress Bar */}
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

        {/* Numbers */}
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span>
            Utilized:{" "}
            <span className="font-medium text-foreground">
              ₹{utilized.toFixed(0)}
            </span>
          </span>
          <span>
            Total:{" "}
            <span className="font-medium text-foreground">
              ₹{totalBudget.toFixed(0)}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
