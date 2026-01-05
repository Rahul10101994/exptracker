"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FinTrackLayout } from "@/components/fintrack/fintrack-layout";
import { useGoals, Goal } from "@/contexts/goal-context";
import { GoalCard } from "@/components/fintrack/goal-card";
import { AddGoalSheet } from "@/components/fintrack/add-goal-sheet";
import { EditGoalSheet } from "@/components/fintrack/edit-goal-sheet";
import * as Collapsible from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { toast } from "@/hooks/use-toast";

export default function GoalPage() {
  const { goals, getGoalProgress, deleteGoal } = useGoals();

  const [isMonthlyOpen, setIsMonthlyOpen] = React.useState(true);
  const [isYearlyOpen, setIsYearlyOpen] = React.useState(true);
  const [isLongTermOpen, setIsLongTermOpen] = React.useState(true);

  const [goalToEdit, setGoalToEdit] = React.useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = React.useState<Goal | null>(null);

  const monthlyGoals = goals.filter((g) => g.type === "monthly");
  const yearlyGoals = goals.filter((g) => g.type === "yearly");
  const longTermGoals = goals.filter((g) => g.type === "long-term");

  const getActiveGoal = (list: Goal[]) =>
    list.find((g) => getGoalProgress(g).progress <= 100) || list[0];

  const activeMonthlyGoal = getActiveGoal(monthlyGoals);
  const activeYearlyGoal = getActiveGoal(yearlyGoals);
  const activeLongTermGoal = getActiveGoal(longTermGoals);

  /* ---------- SAFE DELETE ---------- */
  const handleDelete = React.useCallback(() => {
    if (!goalToDelete) return;

    requestAnimationFrame(() => {
      deleteGoal(goalToDelete.id);

      toast({
        title: "Goal Deleted",
        description: `The goal "${goalToDelete.name}" has been deleted.`,
      });

      setGoalToDelete(null);
    });
  }, [goalToDelete, deleteGoal]);

  /* ---------- SAFE OPENERS ---------- */
  const openEdit = (goal: Goal) => {
    setTimeout(() => setGoalToEdit(goal), 0);
  };

  const openDelete = (goal: Goal) => {
    setTimeout(() => setGoalToDelete(goal), 0);
  };

  return (
    <FinTrackLayout>
      {/* HEADER */}
      <header className="flex items-center pt-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft />
            <span className="sr-only">Back</span>
          </Link>
        </Button>

        <h1 className="text-lg font-bold mx-auto">Financial Goals</h1>

        <AddGoalSheet>
          <Button variant="ghost" size="icon">
            <PlusCircle />
          </Button>
        </AddGoalSheet>
      </header>

      <div className="space-y-6">
        {/* ---------- MONTHLY ---------- */}
        <Collapsible.Root
          open={isMonthlyOpen}
          onOpenChange={setIsMonthlyOpen}
          className="space-y-2"
        >
          <SectionHeader
            title="Monthly Goals"
            open={isMonthlyOpen}
          />

          {monthlyGoals.length ? (
            <div className="space-y-4">
              {!isMonthlyOpen && activeMonthlyGoal && (
                <GoalCard
                  goal={activeMonthlyGoal}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              )}

              <Collapsible.Content className="space-y-4">
                {monthlyGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                ))}
              </Collapsible.Content>
            </div>
          ) : (
            <EmptyState text="No monthly goals set." />
          )}
        </Collapsible.Root>

        {/* ---------- YEARLY ---------- */}
        <Collapsible.Root
          open={isYearlyOpen}
          onOpenChange={setIsYearlyOpen}
          className="space-y-2"
        >
          <SectionHeader
            title="Yearly Goals"
            open={isYearlyOpen}
          />

          {yearlyGoals.length ? (
            <div className="space-y-4">
              {!isYearlyOpen && activeYearlyGoal && (
                <GoalCard
                  goal={activeYearlyGoal}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              )}

              <Collapsible.Content className="space-y-4">
                {yearlyGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                ))}
              </Collapsible.Content>
            </div>
          ) : (
            <EmptyState text="No yearly goals set." />
          )}
        </Collapsible.Root>

        {/* ---------- LONG TERM ---------- */}
        <Collapsible.Root
          open={isLongTermOpen}
          onOpenChange={setIsLongTermOpen}
          className="space-y-2"
        >
          <SectionHeader
            title="Long Term Goals"
            open={isLongTermOpen}
          />

          {longTermGoals.length ? (
            <div className="space-y-4">
              {!isLongTermOpen && activeLongTermGoal && (
                <GoalCard
                  goal={activeLongTermGoal}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              )}

              <Collapsible.Content className="space-y-4">
                {longTermGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                ))}
              </Collapsible.Content>
            </div>
          ) : (
            <EmptyState text="No long-term goals set." />
          )}
        </Collapsible.Root>
      </div>

      {/* ---------- EDIT ---------- */}
      {goalToEdit && (
        <EditGoalSheet
          goal={goalToEdit}
          isOpen
          onClose={() => setGoalToEdit(null)}
        />
      )}

      {/* ---------- DELETE ---------- */}
      <AlertDialog
        open={!!goalToDelete}
        onOpenChange={(open) => !open && setGoalToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the goal{" "}
              <span className="font-semibold capitalize">
                "{goalToDelete?.name}"
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FinTrackLayout>
  );
}

/* ---------- SMALL HELPERS ---------- */

function SectionHeader({
  title,
  open,
}: {
  title: string;
  open: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-base font-semibold">{title}</h2>
      <Collapsible.Trigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ChevronDown
            className={cn(
              "transition-transform",
              open && "rotate-180"
            )}
          />
        </Button>
      </Collapsible.Trigger>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center text-muted-foreground py-10">
      {text}
    </div>
  );
}
