
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useTransactions } from "@/contexts/transactions-context"
import { useMemo, useState, useEffect } from "react"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"

export function SpendingTrendChart() {
  const { currentMonthTransactions } = useTransactions();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const chartData = useMemo(() => {
    const weekStartsOn = 1; // Monday
    const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn });
    const days = Array.from({ length: 7 }).map((_, i) => addDays(startOfThisWeek, i));

    return days.map(day => {
      const dailySpending = currentMonthTransactions
        .filter(t => t.type === 'expense' && isSameDay(new Date(t.date), day))
        .reduce((acc, t) => acc + t.amount, 0);
      return {
        day: format(day, 'EEE'),
        spending: dailySpending
      }
    })
  }, [currentMonthTransactions]);

  const chartConfig = {
    spending: {
      label: "Spending",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>This Week's Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {isClient ? (
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
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
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="spending" fill="var(--color-spending)" radius={8} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            Loading chart...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
