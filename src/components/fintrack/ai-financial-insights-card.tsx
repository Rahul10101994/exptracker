
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/contexts/transactions-context";
import { Bot } from "lucide-react";
import { getDaysInMonth } from "date-fns";

export function AiFinancialInsightsCard() {
  const { transactions } = useTransactions();
  const [insight, setInsight] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      if (transactions.length === 0) {
        setInsight("No transaction data available to generate insights.");
        setIsLoading(false);
        return;
      }
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const expenses = transactions.filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      });

      if (expenses.length === 0) {
        setInsight("You haven't recorded any expenses this month. Great job on saving!");
        setIsLoading(false);
        return;
      }

      const insightMessages = [];

      // Insight 1: Top spending category
      const categoryTotals: Record<string, number> = {};
      expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

      let topCategory = "";
      let topAmount = 0;
      for (const [category, amount] of Object.entries(categoryTotals)) {
        if (amount > topAmount) {
          topAmount = amount;
          topCategory = category;
        }
      }
      insightMessages.push(`Your top spending category this month is "${topCategory}" at $${topAmount.toFixed(2)}. Consider reviewing those expenses.`);
      insightMessages.push(`You've spent the most on "${topCategory}". Is there an opportunity to find savings there?`);

      // Insight 2: Linear Regression Prediction
      const dailyEntriesMap = new Map<number, number>();
      expenses.forEach(t => {
        const day = new Date(t.date).getDate();
        dailyEntriesMap.set(day, (dailyEntriesMap.get(day) || 0) + t.amount);
      });

      const dailyEntriesCumulative: { day: number, totalSpentSoFar: number }[] = [];
      let cumulativeSpend = 0;
      Array.from(dailyEntriesMap.entries())
        .sort((a, b) => a[0] - b[0])
        .forEach(([day, amount]) => {
          cumulativeSpend += amount;
          dailyEntriesCumulative.push({ day, totalSpentSoFar: cumulativeSpend });
        });
      
      const predictMonthEndSpend = (entries: { day: number, totalSpentSoFar: number }[]) => {
        const n = entries.length;
        if (n < 2) return 0; // Need at least 2 data points

        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (const entry of entries) {
          sumX += entry.day;
          sumY += entry.totalSpentSoFar;
          sumXY += (entry.day * entry.totalSpentSoFar);
          sumXX += (entry.day * entry.day);
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const daysInMonth = getDaysInMonth(now);
        return (slope * daysInMonth) + intercept;
      };

      const predictedSpend = predictMonthEndSpend(dailyEntriesCumulative);
      
      if (predictedSpend > 0) {
        insightMessages.push(`Based on your spending so far, you're projected to spend $${predictedSpend.toFixed(2)} this month.`);
      }

      // Pick a random insight to display
      setInsight(insightMessages[Math.floor(Math.random() * insightMessages.length)]);
      setIsLoading(false);

    }, 1200); // simulate network delay

    return () => clearTimeout(timer);
  }, [transactions]);

  return (
    <Card className="border-0 shadow-lg w-full bg-blue-50 text-blue-900">
      <CardHeader className="p-4 pb-2 flex-row items-center gap-3">
        <Bot className="h-5 w-5" />
        <CardTitle className="text-base font-semibold">
          Financial Insight
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-blue-200/50 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-blue-200/50 rounded w-3/4 animate-pulse"></div>
          </div>
        ) : (
          <p className="text-sm font-medium">
            {insight}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
