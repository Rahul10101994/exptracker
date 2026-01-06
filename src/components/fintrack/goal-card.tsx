
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal, useGoals } from "@/contexts/goal-context";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}


export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const { getGoalProgress } = useGoals();
  const { progress, saved } = getGoalProgress(goal);

  const currentMonth = format(new Date(), "MMMM");
  const goalName =
    goal.type === "monthly"
      ? `${currentMonth} ${goal.name}`
      : goal.name;

  const isAchieved = progress >= 100;
  const isOverspent = progress < 0;

  // Optional monthly streak (safe if undefined)
  const streak = (goal as any)?.streak ?? 0;

  return (
    <Card className="border-0 shadow-lg w-full">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-sm sm:text-base font-medium truncate">
            {goalName}
          </CardTitle>
          {streak > 0 && (
            <span className="text-xs font-semibold text-orange-500 whitespace-nowrap">
              🔥 {streak} mo streak
            </span>
          )}
        </div>
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(goal)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onSelect={() => onDelete(goal)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {/* Progress Bar with Label */}
        <div className="relative">
          <Progress
            value={Math.max(0, Math.min(progress, 100))}
            className={cn(
              "h-3 transition-all duration-700 ease-out",
              isAchieved && "[&>div]:bg-green-500",
              isOverspent && "[&>div]:bg-destructive"
            )}
          />

          {/* Progress % label inside bar */}
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center text-[11px] font-semibold",
              progress >= 15 ? "text-white" : "text-muted-foreground"
            )}
          >
            {Math.round(progress)}%
          </span>
        </div>

        {/* Values */}
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span className="truncate">
            {isOverspent ? "Overspent" : "Saved"}:{" "}
            <span
              className={cn(
                "font-medium",
                isOverspent ? "text-destructive" : "text-foreground"
              )}
            >
              ₹{saved.toFixed(0)}
            </span>
          </span>

          <span className="truncate">
            Target:{" "}
            <span className="font-medium text-foreground">
              ₹{goal.targetAmount.toFixed(0)}
            </span>
          </span>
        </div>

        {/* Status Messages */}
        {isAchieved && (
          <p className="text-xs font-semibold text-green-600">
            🎯 Goal Achieved!
          </p>
        )}

        {isOverspent && (
          <p className="text-xs font-semibold text-destructive">
            ⚠ Budget exceeded this month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
