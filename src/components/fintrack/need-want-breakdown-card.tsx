
"use client";

import * as React from "react";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/contexts/transactions-context";
import { ArrowDown, ArrowUp } from "lucide-react";

export function NeedWantBreakdownCard({
  transactions,
  prevMonthTransactions,
  from,
  to,
}: {
  transactions: Transaction[];
  prevMonthTransactions: Transaction[];
  from?: string;
  to?: string;
}) {
  const { needTotal, wantTotal, totalExpense } = React.useMemo(() => {
    let need = 0;
    let want = 0;

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (t.spendingType === "need") need += t.amount;
        if (t.spendingType === "want") want += t.amount;
      });

    return {
      needTotal: need,
      wantTotal: want,
      totalExpense: need + want,
    };
  }, [transactions]);

  const { prevNeedTotal, prevWantTotal } = React.useMemo(() => {
    let need = 0;
    let want = 0;

    prevMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (t.spendingType === "need") need += t.amount;
        if (t.spendingType === "want") want += t.amount;
      });

    return { prevNeedTotal: need, prevWantTotal: want };
  }, [prevMonthTransactions]);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const needChange = calculateChange(needTotal, prevNeedTotal);
  const wantChange = calculateChange(wantTotal, prevWantTotal);

  const needPercentage =
    totalExpense > 0 ? (needTotal / totalExpense) * 100 : 0;
  const wantPercentage =
    totalExpense > 0 ? (wantTotal / totalExpense) * 100 : 0;

  if (totalExpense === 0) return null;

  const TrendIndicator = ({ change }: { change: number }) => {
    if (change === 0) return null;
    const isIncrease = change > 0;
    const colorClass = isIncrease ? "text-red-500" : "text-green-500";
    const Icon = isIncrease ? ArrowUp : ArrowDown;

    return (
      <span className={`flex items-center text-[10px] sm:text-xs ${colorClass}`}>
        <Icon className="h-3 w-3" />
        {Math.abs(change).toFixed(0)}%
      </span>
    );
  };

  return (
    <Card
      className="
        border-0 shadow-md
        w-full
        max-w-full
      "
    >
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm sm:text-base font-medium">
          Needs vs Wants
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        {/* Progress bar */}
        <div className="flex w-full h-2 sm:h-3 rounded-full overflow-hidden">
          <div
            className="bg-green-500 transition-all"
            style={{ width: `${needPercentage}%` }}
          />
          <div
            className="bg-orange-500 transition-all"
            style={{ width: `${wantPercentage}%` }}
          />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {/* Needs */}
          <Link href={`/transactions?from=${from}&to=${to}&spendingType=need`} className="block hover:bg-muted p-2 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs sm:text-sm font-medium">Needs</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="font-bold text-sm sm:text-base">
                ₹{needTotal.toFixed(0)}
              </p>
              <TrendIndicator change={needChange} />
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {needPercentage.toFixed(1)}% of spending
            </p>
          </Link>

          {/* Wants */}
           <Link href={`/transactions?from=${from}&to=${to}&spendingType=want`} className="block hover:bg-muted p-2 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-xs sm:text-sm font-medium">Wants</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="font-bold text-sm sm:text-base">
                ₹{wantTotal.toFixed(0)}
              </p>
              <TrendIndicator change={wantChange} />
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {wantPercentage.toFixed(1)}% of spending
            </p>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
