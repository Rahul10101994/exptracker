
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/contexts/transactions-context";
import { Progress } from "@/components/ui/progress";

export function ReportCategoryBreakdown({ transactions }: { transactions: Transaction[] }) {
  const { categoryData, totalExpense } = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    const expenses = transactions.filter((t) => t.type === "expense");
    
    expenses.forEach((t) => {
        const categoryName = t.category.charAt(0).toUpperCase() + t.category.slice(1);
        if (categoryTotals[categoryName]) {
          categoryTotals[categoryName] += t.amount;
        } else {
          categoryTotals[categoryName] = t.amount;
        }
      });
    
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

    const categoryData = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    return { categoryData, totalExpense };
  }, [transactions]);


  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-base font-medium">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-4">
        {categoryData.length > 0 ? (
            categoryData.map(({ category, amount, percentage }) => (
            <div key={category}>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium capitalize">{category}</span>
                    <span className='text-sm text-muted-foreground'>
                        ${amount.toFixed(2)} ({percentage.toFixed(0)}%)
                    </span>
                </div>
                <Progress value={percentage} className="h-2" />
            </div>
        ))
        ) : (
            <div className="text-center text-muted-foreground py-10">
                No expense data for this period.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
