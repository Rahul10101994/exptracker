
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/contexts/transactions-context";
import { useBudget } from "@/contexts/budget-context";
import { Bot, AlertTriangle } from "lucide-react";
import { getDaysInMonth, getDate } from "date-fns";
import { cn } from "@/lib/utils";

export function AiFinancialInsightsCard() {
  const { transactions } = useTransactions();
  const { budgets } = useBudget();
  const [insight, setInsight] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isWarning, setIsWarning] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    setIsWarning(false);

    const timer = setTimeout(() => {
      const now = new Date();
      const daysPassed = getDate(now);
      const totalDaysInMonth = getDaysInMonth(now);
      
      if (transactions.length === 0) {
        setInsight("No transaction data available to generate insights.");
        setIsLoading(false);
        return;
      }

      // --- 1. Overspend Prediction (Highest Priority) ---
      let highestOverspend = { category: '', amount: 0, confidence: '' };

      for (const category in budgets) {
        const budgetAmount = budgets[category].amount;
        if (budgetAmount <= 0) continue;

        const categoryExpensesThisMonth = transactions.filter(
          (t) =>
            t.type === "expense" &&
            t.category.toLowerCase() === category.toLowerCase() &&
            new Date(t.date).getMonth() === now.getMonth()
        );
        
        if (categoryExpensesThisMonth.length === 0) continue;

        const recurringTotal = categoryExpensesThisMonth
            .filter(t => t.recurring)
            .reduce((sum, t) => sum + t.amount, 0);
            
        const nonRecurringTransactions = categoryExpensesThisMonth.filter(t => !t.recurring);
        const nonRecurringSpend = nonRecurringTransactions.reduce((sum, t) => sum + t.amount, 0);

        // --- INTELLIGENCE UPGRADE: Only predict if we have enough data points ---
        if (nonRecurringTransactions.length < 5) continue;

        const dailySpendRate = nonRecurringSpend / daysPassed;
        const predictedNonRecurringSpend = dailySpendRate * totalDaysInMonth;
        const predictedSpend = predictedNonRecurringSpend + recurringTotal;
        
        if (predictedSpend > budgetAmount) {
          const overspendAmount = predictedSpend - budgetAmount;

          // --- INTELLIGENCE UPGRADE: More nuanced confidence ---
          let confidenceScore = 0;
          if (daysPassed > 10) confidenceScore += 50;
          if (daysPassed > 20) confidenceScore += 20; // Extra points for being late in month
          if (nonRecurringTransactions.length > 10) confidenceScore += 30;
          
          let confidenceText = 'Low';
          if (confidenceScore >= 70) confidenceText = 'High';
          else if (confidenceScore >= 50) confidenceText = 'Medium';

          if (overspendAmount > highestOverspend.amount) {
            highestOverspend = { category, amount: overspendAmount, confidence: confidenceText };
          }
        }
      }

      if (highestOverspend.amount > 0) {
        setInsight(`At this pace, you may overspend on "${highestOverspend.category}" by ₹${highestOverspend.amount.toFixed(0)}. (Confidence: ${highestOverspend.confidence})`);
        setIsWarning(true);
        setIsLoading(false);
        return;
      }

      // --- 2. Fallback to Top Spending Category ---
      const categoryTotals: Record<string, number> = {};
      const currentMonthExpenses = transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth());

      if (currentMonthExpenses.length === 0) {
        setInsight("You haven't recorded any expenses this month. Great job on saving!");
        setIsLoading(false);
        return;
      }

      currentMonthExpenses.forEach(t => {
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
      
      if (topCategory) {
        setInsight(`Your top spending category this month is "${topCategory}" at ₹${topAmount.toFixed(2)}. Consider reviewing those expenses.`);
      } else {
        setInsight("Keep tracking your expenses to unlock more insights!");
      }
      
      setIsLoading(false);
    }, 1200); // simulate network delay

    return () => clearTimeout(timer);
  }, [transactions, budgets]);

  return (
    <Card className={cn(
      "border-0 shadow-lg w-full transition-colors",
      isWarning ? "bg-amber-100 text-amber-900" : "bg-blue-50 text-blue-900"
    )}>
      <CardHeader className="p-4 pb-2 flex-row items-center gap-3">
        {isWarning ? <AlertTriangle className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        <CardTitle className="text-base font-semibold">
          {isWarning ? "Spending Alert" : "Financial Insight"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <div className="space-y-2">
            <div className={cn("h-4 rounded w-full animate-pulse", isWarning ? "bg-amber-200/60" : "bg-blue-200/50")}></div>
            <div className={cn("h-4 rounded w-3/4 animate-pulse", isWarning ? "bg-amber-200/60" : "bg-blue-200/50")}></div>
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
