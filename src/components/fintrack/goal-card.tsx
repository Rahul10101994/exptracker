"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Goal, useGoals } from '@/contexts/goal-context';
import { format } from 'date-fns';

export function GoalCard({ goal }: { goal: Goal }) {
  const { getGoalProgress } = useGoals();
  const { progress, saved } = getGoalProgress(goal);
  const currentMonth = format(new Date(), 'MMMM');

  const goalName = goal.type === 'monthly' ? `${currentMonth} ${goal.name}` : goal.name;

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-base font-medium">{goalName}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Progress value={Math.max(0, progress)} className="h-2" />
        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
          <span>{progress < 0 ? 'Overspent' : 'Saved'}: ${saved.toFixed(2)}</span>
          <span>Target: ${goal.targetAmount.toFixed(2)}</span>
        </div>
        {progress > 100 && (
             <p className="text-xs text-green-600 font-semibold mt-1">Goal Achieved!</p>
        )}
        {progress < 0 && (
             <p className="text-xs text-destructive font-semibold mt-1">Budget exceeded this month.</p>
        )}
      </CardContent>
    </Card>
  );
}
