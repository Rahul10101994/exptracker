
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/contexts/transactions-context";
import { Progress } from "@/components/ui/progress";

export function NeedWantBreakdownCard({ transactions }: { transactions: Transaction[] }) {
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

  const needPercentage = totalExpense > 0 ? (needTotal / totalExpense) * 100 : 0;
  const wantPercentage = totalExpense > 0 ? (wantTotal / totalExpense) * 100 : 0;

  if (totalExpense === 0) {
    return null;
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
                <p className="font-bold">${needTotal.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{needPercentage.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500"></span>
                <span className="font-medium">Wants</span>
            </div>
             <div className="text-right">
                <p className="font-bold">${wantTotal.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{wantPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
