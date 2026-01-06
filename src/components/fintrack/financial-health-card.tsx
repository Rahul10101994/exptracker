
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/contexts/transactions-context";
import { useBudget } from "@/contexts/budget-context";
import { cn } from "@/lib/utils";

const SCORE_CONFIG = {
  savingsRate: { weight: 30, target: 30 }, // Target 30% savings rate
  budgetAdherence: { weight: 25 },
  spendingConsistency: { weight: 20 },
  emergencyBuffer: { weight: 15 },
  incomeStability: { weight: 10 },
};

// Helper to calculate Standard Deviation
const getStdDev = (arr: number[]): number => {
  const n = arr.length;
  if (n === 0) return 0;
  const mean = arr.reduce((a, b) => a + b) / n;
  return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
};


export function FinancialHealthCard() {
  const { currentMonthTransactions, transactions } = useTransactions();
  const { budgets } = useBudget();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { score, tip } = React.useMemo(() => {
    // --- 1. Savings Score (30 pts) ---
    const income = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savings = income - expense;
    const savingsPercent = income > 0 ? (savings / income) * 100 : 0;
    const savingsScore = Math.min((savingsPercent / SCORE_CONFIG.savingsRate.target) * SCORE_CONFIG.savingsRate.weight, SCORE_CONFIG.savingsRate.weight);

    // --- 2. Budget Adherence Score (25 pts) ---
    const budgetCategories = Object.keys(budgets);
    let categoriesWithinBudget = 0;
    if (budgetCategories.length > 0) {
      budgetCategories.forEach(cat => {
        const budgetAmount = budgets[cat].amount;
        const spent = currentMonthTransactions.filter(t => t.category.toLowerCase() === cat.toLowerCase()).reduce((sum, t) => sum + t.amount, 0);
        if (spent <= budgetAmount) {
          categoriesWithinBudget++;
        }
      });
      var budgetScore = (categoriesWithinBudget / budgetCategories.length) * SCORE_CONFIG.budgetAdherence.weight;
    } else {
        var budgetScore = SCORE_CONFIG.budgetAdherence.weight; // Full points if no budget set
    }


    // --- 3. Spending Consistency Score (20 pts) ---
    const dailyExpenses = new Map<string, number>();
     currentMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
        const day = new Date(t.date).toISOString().split('T')[0];
        dailyExpenses.set(day, (dailyExpenses.get(day) || 0) + t.amount);
    });
    const expenseValues = Array.from(dailyExpenses.values());
    const stdDev = getStdDev(expenseValues);
    const avgDailyExpense = expense > 0 ? expense / expenseValues.length : 0;
    // Score is higher if variation is low compared to average daily spend
    const consistencyRatio = avgDailyExpense > 0 ? stdDev / avgDailyExpense : 1;
    const consistencyScore = Math.max(0, (1 - consistencyRatio)) * SCORE_CONFIG.spendingConsistency.weight;

    // --- 4. Emergency Buffer (15 pts) & 5. Income Stability (10 pts) ---
    // Simplified for this context
    const emergencyBufferScore = savings > 0 ? SCORE_CONFIG.emergencyBuffer.weight : 0;
    const incomeStabilityScore = income > 0 ? SCORE_CONFIG.incomeStability.weight : 0;

    const finalScore = Math.round(savingsScore + budgetScore + consistencyScore + emergencyBufferScore + incomeStabilityScore);

    // --- Generate Tip ---
    let generatedTip = "Keep up the great work and stay consistent!";
    if (finalScore < 80) {
      if (savingsScore < SCORE_CONFIG.savingsRate.weight * 0.8) {
        generatedTip = "Try to increase your savings rate. Even small amounts help!";
      } else if (budgetScore < SCORE_CONFIG.budgetAdherence.weight * 0.8) {
        generatedTip = "Review your budgets to see where you can cut back.";
      } else if (consistencyScore < SCORE_CONFIG.spendingConsistency.weight * 0.8) {
        generatedTip = "Your spending is a bit erratic. Try to make it more predictable.";
      }
    }

    return { score: finalScore, tip: generatedTip };

  }, [currentMonthTransactions, budgets, transactions]);

  const scoreColor = score < 50 ? "text-red-500" : score < 75 ? "text-yellow-500" : "text-green-500";
  const ringColor = score < 50 ? "ring-red-500/30" : score < 75 ? "ring-yellow-500/30" : "ring-green-500/30";
  const progressColor = score < 50 ? "stroke-red-500" : score < 75 ? "stroke-yellow-500" : "stroke-green-500";

  const circumference = 32 * 2 * Math.PI;

  if (!isMounted) {
    return (
      <Card className="border-0 shadow-lg w-full">
          <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm sm:text-base font-medium">Financial Health</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex items-center justify-center h-24">
              <div className="animate-pulse h-8 w-32 rounded-md bg-muted"></div>
          </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg w-full">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm sm:text-base font-medium">Financial Health</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex items-center gap-4">
        <div className="relative h-20 w-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
            <circle
              className={cn("stroke-current transition-colors", ringColor)}
              strokeWidth="6"
              fill="transparent"
              r="32"
              cx="35"
              cy="35"
            />
            <circle
              className={cn("stroke-current transition-all duration-1000 ease-out", progressColor)}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (score / 100) * circumference}
              strokeLinecap="round"
              fill="transparent"
              r="32"
              cx="35"
              cy="35"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-bold", scoreColor)}>{score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{tip}</p>
        </div>
      </CardContent>
    </Card>
  );
}
