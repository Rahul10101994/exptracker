
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/contexts/transactions-context";
import { ArrowDown, ArrowUp } from "lucide-react";

export function NeedWantBreakdownCard({ transactions, prevMonthTransactions }: { transactions: Transaction[], prevMonthTransactions: Transaction[] }) {
  const { needTotal, wantTotal, totalExpense } = React.useMemo(() => {
    let need = 0;
    let want = 0;

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (t.spendingType === "need") {
          need += t.amount;
        } else if (t.spendingType === "want") {
          want += t.amount;
        }
      });

    const total = need + want;

    return { needTotal: need, wantTotal: want, totalExpense: total };
  }, [transactions]);

  const { prevNeedTotal, prevWantTotal } = React.useMemo(() => {
    let need = 0;
    let want = 0;

    prevMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (t.spendingType === "need") {
          need += t.amount;
        } else if (t.spendingType === "want") {
          want += t.amount;
        }
      });

    return { prevNeedTotal: need, prevWantTotal: want };
  }, [prevMonthTransactions]);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  };

  const needChange = calculateChange(needTotal, prevNeedTotal);
  const wantChange = calculateChange(wantTotal, prevWantTotal);

  const needPercentage = totalExpense > 0 ? (needTotal / totalExpense) * 100 : 0;
  const wantPercentage = totalExpense > 0 ? (wantTotal / totalExpense) * 100 : 0;

  if (totalExpense === 0) {
    return null;
  }

  const TrendIndicator = ({ change }: { change: number }) => {
    if (change === 0) return null;
    const isIncrease = change > 0;
    // For spending, an increase is bad (red), a decrease is good (green)
    const colorClass = isIncrease ? "text-red-500" : "text-green-500";
    const Icon = isIncrease ? ArrowUp : ArrowDown;

    return (
      <span className={`flex items-center text-xs font-semibold ${colorClass}`}>
        <Icon className="h-3 w-3" />
        {Math.abs(change).toFixed(0)}%
      </span>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-base font-medium">Needs vs. Wants</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex w-full h-2 rounded-full overflow-hidden mb-4">
            <div
                className="bg-green-500"
                style={{ width: `${needPercentage}%` }}
            ></div>
            <div
                className="bg-orange-500"
                style={{ width: `${wantPercentage}%` }}
            ></div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500"></span>
              <span className="font-medium">Needs</span>
            </div>
            <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                    <p className="font-bold">${needTotal.toFixed(2)}</p>
                    <TrendIndicator change={needChange} />
                </div>
                <p className="text-sm text-muted-foreground">{needPercentage.toFixed(1)}% of spending</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500"></span>
                <span className="font-medium">Wants</span>
            </div>
             <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                    <p className="font-bold">${wantTotal.toFixed(2)}</p>
                    <TrendIndicator change={wantChange} />
                </div>
                <p className="text-sm text-muted-foreground">{wantPercentage.toFixed(1)}% of spending</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
