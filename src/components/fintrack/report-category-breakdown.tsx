
"use client";

import { useMemo } from "react";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/contexts/transactions-context";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ReportCategoryBreakdown({
  transactions,
  from,
  to,
}: {
  transactions: Transaction[];
  from?: string;
  to?: string;
}) {
  const { categoryData, totalExpense } = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    const expenses = transactions.filter(
      (t) => t.type === "expense" || t.type === "investment"
    );

    expenses.forEach((t) => {
      const category = t.type === 'investment' ? 'Investment' : (
        t.category.charAt(0).toUpperCase() +
        t.category.slice(1));

      categoryTotals[category] =
        (categoryTotals[category] || 0) + t.amount;
    });

    const totalExpense = expenses.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const categoryData = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount: Number(amount.toFixed(2)),
        percentage:
          totalExpense > 0
            ? (amount / totalExpense) * 100
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { categoryData, totalExpense };
  }, [transactions]);

  return (
    <Card className="border-0 shadow-lg w-full">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm sm:text-base font-medium">
          Category Breakdown
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-4">
        {categoryData.length > 0 ? (
          categoryData.map(
            ({ category, amount, percentage }) => {
              const progressColor =
                percentage > 50
                  ? "[&>div]:bg-destructive"
                  : percentage > 30
                  ? "[&>div]:bg-orange-500"
                  : "[&>div]:bg-primary";
              
              const type = category === 'Investment' ? 'investment' : 'expense';
              const categoryFilter = category === 'Investment' ? '' : `&category=${category.toLowerCase()}`;
              const href = from && to ? `/transactions?from=${from}&to=${to}&type=${type}${categoryFilter}` : '/transactions';

              return (
                <Link href={href} key={category} className="block hover:bg-muted -m-2 p-2 rounded-lg">
                  <div className="space-y-1">
                    {/* Label row */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium truncate">
                        {category}
                      </span>

                      <span className="text-muted-foreground whitespace-nowrap">
                        ₹{amount.toFixed(0)} •{" "}
                        {percentage.toFixed(0)}%
                      </span>
                    </div>

                    {/* Progress */}
                    <Progress
                      value={percentage}
                      className={cn(
                        "h-2 transition-all duration-700 ease-out",
                        progressColor
                      )}
                    />
                  </div>
                </Link>
              );
            }
          )
        ) : (
          <div className="text-center text-sm text-muted-foreground py-10">
            No expense data for this period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
