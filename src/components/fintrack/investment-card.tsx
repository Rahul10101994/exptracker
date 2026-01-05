
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/contexts/transactions-context";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function InvestmentCard() {
  const { currentMonthTransactions } = useTransactions();

  const { totalInvestment, investmentCount } = useMemo(() => {
    const investmentTransactions = currentMonthTransactions.filter(
      (t) => t.category?.toLowerCase() === "investment"
    );

    const total = investmentTransactions.reduce(
      (acc, t) => acc + t.amount,
      0
    );

    return {
      totalInvestment: total,
      investmentCount: investmentTransactions.length,
    };
  }, [currentMonthTransactions]);

  const hasInvestment = investmentCount > 0;

  return (
    <Card className="border-0 shadow-lg w-full h-24">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm sm:text-base font-medium">
          Investments
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-1">
        <p
          className={cn(
            "text-xl sm:text-2xl font-bold truncate",
            hasInvestment ? "text-purple-600" : "text-muted-foreground"
          )}
        >
          ₹{totalInvestment.toFixed(0)}
        </p>

        <p className="text-xs sm:text-sm text-muted-foreground">
          {investmentCount === 0
            ? "No investments"
            : `${investmentCount} active this month`}
        </p>
      </CardContent>
    </Card>
  );
}
