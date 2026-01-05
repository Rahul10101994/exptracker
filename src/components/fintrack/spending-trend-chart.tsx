"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTransactions } from "@/contexts/transactions-context";
import { useMemo, useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
} from "date-fns";

export function SpendingTrendChart() {
  const { currentMonthTransactions } = useTransactions();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const chartData = useMemo(() => {
    const weekStartsOn = 1; // Monday
    const start = startOfWeek(new Date(), { weekStartsOn });

    return Array.from({ length: 7 }).map((_, i) => {
      const day = addDays(start, i);

      const spending = currentMonthTransactions
        .filter(
          (t) =>
            t.type === "expense" &&
            isSameDay(new Date(t.date), day)
        )
        .reduce((acc, t) => acc + t.amount, 0);

      return {
        day: format(day, "EEE"),
        spending,
      };
    });
  }, [currentMonthTransactions]);

  const totalWeekSpending = chartData.reduce(
    (s, d) => s + d.spending,
    0
  );

  const chartConfig = {
    spending: {
      label: "Spending",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card className="border-0 shadow-lg w-full">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm sm:text-base font-medium">
          This Week’s Spending
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {isClient ? (
          totalWeekSpending > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="h-48 w-full"
            >
              <BarChart
                data={chartData}
                margin={{ top: 16, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => `₹${v}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent indicator="dot" />
                  }
                />
                <Bar
                  dataKey="spending"
                  fill="var(--color-spending)"
                  radius={6}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No spending recorded this week
            </div>
          )
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Loading chart…
          </div>
        )}
      </CardContent>
    </Card>
  );
}
