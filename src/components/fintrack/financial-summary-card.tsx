
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/contexts/transactions-context";
import { useMemo } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function FinancialSummaryCard({
  transactions,
  prevMonthTransactions,
}: {
  transactions: Transaction[];
  prevMonthTransactions: Transaction[];
}) {
  /* ---------- CURRENT MONTH ---------- */
  const { income, expense, savings, investments } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    const investments = transactions
      .filter((t) => t.category.toLowerCase() === "investment")
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      income,
      expense,
      savings: income - expense,
      investments,
    };
  }, [transactions]);

  /* ---------- PREVIOUS MONTH ---------- */
  const { incomeChange, expenseChange, savingsChange, investmentChange } = useMemo(() => {
    const prevIncome = prevMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const prevExpense = prevMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    const prevSavings = prevIncome - prevExpense;

    const prevInvestments = prevMonthTransactions
        .filter(t => t.category.toLowerCase() === 'investment')
        .reduce((sum, t) => sum + t.amount, 0);

    const change = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : curr < 0 ? -100 : 0;
      return ((curr - prev) / Math.abs(prev)) * 100;
    };

    return {
      incomeChange: change(income, prevIncome),
      expenseChange: change(expense, prevExpense),
      savingsChange: change(savings, prevSavings),
      investmentChange: change(investments, prevInvestments),
    };
  }, [transactions, prevMonthTransactions, income, expense, savings, investments]);


  /* ---------- TREND ---------- */
  const Trend = ({ value, invert = false }: { value: number; invert?: boolean }) => {
    if (value === 0) return null;

    const positive = invert ? value < 0 : value > 0;
    const Icon = positive ? ArrowUp : ArrowDown;

    return (
      <span
        className={cn(
          "flex items-center gap-0.5 text-[11px] font-semibold",
          positive ? "text-green-500" : "text-red-500"
        )}
      >
        <Icon className="h-3 w-3" />
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  return (
    <Card className="border-0 shadow-lg w-full">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm sm:text-base font-medium">
          Financial Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-4">
          {/* Income */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Income</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-green-600 truncate">
                ₹{income.toFixed(0)}
              </p>
              <Trend value={incomeChange} />
            </div>
          </div>

          {/* Expense */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Expense</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-red-600 truncate">
                ₹{expense.toFixed(0)}
              </p>
              <Trend value={expenseChange} invert />
            </div>
          </div>

          {/* Savings */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Savings</p>
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  "text-lg font-bold truncate",
                  savings >= 0 ? "text-blue-600" : "text-red-600"
                )}
              >
                ₹{savings.toFixed(0)}
              </p>
              <Trend value={savingsChange} />
            </div>
          </div>

          {/* Investments */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Investments</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-purple-600 truncate">
                ₹{investments.toFixed(0)}
              </p>
              <Trend value={investmentChange} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
