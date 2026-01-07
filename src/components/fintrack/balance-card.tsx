
"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useTransactions } from "@/contexts/transactions-context";
import { useAccounts } from "@/contexts/account-context";
import { useMemo } from "react";

export function BalanceCard() {
  const { currentMonthTransactions } = useTransactions();
  const { accounts, getAccountBalance } = useAccounts();
  const currentDate = format(new Date(), "MMMM yyyy");

  const { totalBalance, income, expense } = useMemo(() => {
    const income = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = currentMonthTransactions
      .filter((t) => t.type === "expense" || t.type === 'investment')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const total = accounts.reduce((acc, account) => acc + getAccountBalance(account.id), 0);

    return {
      totalBalance: total,
      income,
      expense,
    };
  }, [currentMonthTransactions, accounts, getAccountBalance]);

  return (
    <Card
      className="
        bg-accent border-0 shadow-lg
        w-full
        max-w-full
      "
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between text-accent-foreground/80">
          <p className="text-sm font-medium">Total Balance</p>
          <p className="text-xs sm:text-sm font-medium">{currentDate}</p>
        </div>

        {/* Balance */}
        <p className="text-2xl sm:text-3xl font-bold text-accent-foreground truncate">
          ₹{totalBalance.toFixed(2)}
        </p>

        {/* Income / Expense */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Income */}
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/30 p-1.5">
              <ArrowDown className="h-4 w-4 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-accent-foreground/80">
                Income
              </p>
              <p className="text-sm sm:text-base font-semibold text-accent-foreground truncate">
                ₹{income.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Expense */}
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/30 p-1.5">
              <ArrowUp className="h-4 w-4 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-accent-foreground/80">
                Money Out
              </p>
              <p className="text-sm sm:text-base font-semibold text-accent-foreground truncate">
                ₹{expense.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
