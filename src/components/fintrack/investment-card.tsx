
"use client";

import { useTransactions } from "@/contexts/transactions-context";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { StatCard } from "./stat-card";

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
    <StatCard
      label="Investments"
      value={`₹${totalInvestment.toFixed(0)}`}
      valueClassName={cn(
        hasInvestment ? "text-purple-600" : "text-muted-foreground"
      )}
    />
  );
}
