
"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Transaction } from "@/contexts/transactions-context";

export function ReportCategoryBreakdown({ transactions }: { transactions: Transaction[] }) {
  const chartData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const categoryName = t.category.charAt(0).toUpperCase() + t.category.slice(1);
        if (categoryTotals[categoryName]) {
          categoryTotals[categoryName] += t.amount;
        } else {
          categoryTotals[categoryName] = t.amount;
        }
      });
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
    })).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart
                accessibilityLayer
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
            >
                <CartesianGrid horizontal={false} />
                <YAxis
                    dataKey="category"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={80}
                />
                <XAxis type="number" hide />
                <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar
                    dataKey="amount"
                    fill="var(--color-amount)"
                    radius={5}
                    layout="vertical"
                />
            </BarChart>
            </ChartContainer>
        ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
                No expense data for this period.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
