
"use client";

import { useGoals } from "@/contexts/goal-context";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { StatCard } from "./stat-card";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

export function InvestmentCard() {
  const { goals, getGoalProgress } = useGoals();

  const investmentGoal = useMemo(() => {
    // Find the first goal with "investment" in its name, case-insensitive
    return goals.find(g => g.name.toLowerCase().includes("investment"));
  }, [goals]);

  if (!investmentGoal) {
    return (
        <StatCard
            label="Investment Goal"
            value="No Goal"
            valueClassName="text-muted-foreground"
        />
    );
  }

  const { progress, saved } = getGoalProgress(investmentGoal);
  const isAchieved = progress >= 100;

  return (
    <Card className="border-0 shadow-lg w-full h-20">
        <CardContent className="flex flex-col justify-center h-full p-3 gap-2">
             <div className="flex justify-between items-baseline">
                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                    {investmentGoal.name}
                </p>
                 <p className="text-xs font-semibold text-purple-600">
                    {Math.round(progress)}%
                </p>
            </div>
            <Progress
                value={Math.min(progress, 100)}
                className={cn(
                  "h-2",
                  isAchieved && "[&>div]:bg-green-500",
                  !isAchieved && "[&>div]:bg-purple-500"
                )}
            />
            <div className="flex justify-between items-baseline text-xs text-muted-foreground">
                <span>₹{saved.toFixed(0)}</span>
                <span>₹{investmentGoal.targetAmount.toFixed(0)}</span>
            </div>
        </CardContent>
    </Card>
  );
}
