
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/contexts/transactions-context";
import { Bot } from "lucide-react";

export function AiFinancialInsightsCard() {
  const { transactions } = useTransactions();
  const [insight, setInsight] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);

    // Simulate AI thinking for a moment
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

      // Insight 2: Spending vs average
      const totalSpend = expenses.reduce((sum, t) => sum + t.amount, 0);
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const dayOfMonth = now.getDate();
      const averageSpendPerDay = totalSpend / dayOfMonth;
      const projectedSpend = averageSpendPerDay * daysInMonth;

      const insightMessages = [
        `Your top spending category this month is "${topCategory}" at $${topAmount.toFixed(2)}. Consider reviewing those expenses.`,
        `Based on your spending so far, you're projected to spend $${projectedSpend.toFixed(2)} this month.`,
        `You've spent the most on "${topCategory}". Is there an opportunity to find savings there?`
      ];

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
