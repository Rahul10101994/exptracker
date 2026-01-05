
"use client";

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinTrackLayout } from '@/components/fintrack/fintrack-layout';
import { useGoals } from '@/contexts/goal-context';
import { GoalCard } from '@/components/fintrack/goal-card';
import { AddGoalSheet } from '@/components/fintrack/add-goal-sheet';
import * as Collapsible from '@radix-ui/react-collapsible';
import { cn } from '@/lib/utils';
import { Goal } from '@/contexts/goal-context';
import { EditGoalSheet } from '@/components/fintrack/edit-goal-sheet';
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
import { toast } from '@/hooks/use-toast';

export default function GoalPage() {
    const { goals, getGoalProgress, deleteGoal } = useGoals();
    const [isMonthlyOpen, setIsMonthlyOpen] = React.useState(true);
    const [isYearlyOpen, setIsYearlyOpen] = React.useState(true);
    const [isLongTermOpen, setIsLongTermOpen] = React.useState(true);
    const [goalToEdit, setGoalToEdit] = React.useState<Goal | null>(null);
    const [goalToDelete, setGoalToDelete] = React.useState<Goal | null>(null);
    
    const monthlyGoals = goals.filter(g => g.type === 'monthly');
    const yearlyGoals = goals.filter(g => g.type === 'yearly');
    const longTermGoals = goals.filter(g => g.type === 'long-term');

    const getActiveGoal = (goals: Goal[]): Goal | undefined => {
        return goals.find(g => getGoalProgress(g).progress <= 100) || goals[0];
    }
    
    const activeMonthlyGoal = getActiveGoal(monthlyGoals);
    const activeYearlyGoal = getActiveGoal(yearlyGoals);
    const activeLongTermGoal = getActiveGoal(longTermGoals);

    const handleDelete = () => {
        if (goalToDelete) {
            deleteGoal(goalToDelete.id);
            toast({
                title: "Goal Deleted",
                description: `The goal "${goalToDelete.name}" has been deleted.`,
            });
            setGoalToDelete(null);
        }
    };

    return (
        <FinTrackLayout>
            <header className="flex items-center pt-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="text-lg font-bold text-foreground mx-auto">Financial Goals</h1>
                <AddGoalSheet>
                    <Button variant="ghost" size="icon">
                        <PlusCircle />
                    </Button>
                </AddGoalSheet>
            </header>

            <div className="space-y-6">
                <Collapsible.Root open={isMonthlyOpen} onOpenChange={setIsMonthlyOpen} className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h2 className="text-base font-semibold">Monthly Goals</h2>
                        <Collapsible.Trigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronDown className={cn("transition-transform", isMonthlyOpen && "rotate-180")} />
                                <span className="sr-only">{isMonthlyOpen ? 'Collapse' : 'Expand'}</span>
                            </Button>
                        </Collapsible.Trigger>
                    </div>
                    {monthlyGoals.length > 0 ? (
                         <div className="space-y-4">
                           {!isMonthlyOpen && activeMonthlyGoal && <GoalCard goal={activeMonthlyGoal} onEdit={setGoalToEdit} onDelete={setGoalToDelete} />}
                            <Collapsible.Content className="space-y-4">
                                {monthlyGoals.map(goal => <GoalCard key={goal.id} goal={goal} onEdit={setGoalToEdit} onDelete={setGoalToDelete} />)}
                            </Collapsible.Content>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            No monthly goals set.
                        </div>
                    )}
                </Collapsible.Root>

                <Collapsible.Root open={isYearlyOpen} onOpenChange={setIsYearlyOpen} className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h2 className="text-base font-semibold">Yearly Goals</h2>
                        <Collapsible.Trigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronDown className={cn("transition-transform", isYearlyOpen && "rotate-180")} />
                                <span className="sr-only">{isYearlyOpen ? 'Collapse' : 'Expand'}</span>
                            </Button>
                        </Collapsible.Trigger>
                    </div>
                    {yearlyGoals.length > 0 ? (
                        <div className="space-y-4">
                           {!isYearlyOpen && activeYearlyGoal && <GoalCard goal={activeYearlyGoal} onEdit={setGoalToEdit} onDelete={setGoalToDelete} />}
                           <Collapsible.Content className="space-y-4">
                               {yearlyGoals.map(goal => <GoalCard key={goal.id} goal={goal} onEdit={setGoalToEdit} onDelete={setGoalToDelete} />)}
                           </Collapsible.Content>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            No yearly goals set.
                        </div>
                    )}
                </Collapsible.Root>
                
                <Collapsible.Root open={isLongTermOpen} onOpenChange={setIsLongTermOpen} className="space-y-2">
                     <div className="flex justify-between items-center">
                        <h2 className="text-base font-semibold">Long Term Goals</h2>
                        <Collapsible.Trigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronDown className={cn("transition-transform", isLongTermOpen && "rotate-180")} />
                                <span className="sr-only">{isLongTermOpen ? 'Collapse' : 'Expand'}</span>
                            </Button>
                        </Collapsible.Trigger>
                    </div>
                    {longTermGoals.length > 0 ? (
                        <div className="space-y-4">
                            {!isLongTermOpen && activeLongTermGoal && <GoalCard goal={activeLongTermGoal} onEdit={setGoalToEdit} onDelete={setGoalToDelete} />}
                            <Collapsible.Content className="space-y-4">
                                {longTermGoals.map(goal => <GoalCard key={goal.id} goal={goal} onEdit={setGoalToEdit} onDelete={setGoalToDelete} />)}
                            </Collapsible.Content>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            No long-term goals set.
                        </div>
                    )}
                </Collapsible.Root>
            </div>

            {goalToEdit && (
                <EditGoalSheet
                    goal={goalToEdit}
                    isOpen={!!goalToEdit}
                    onClose={() => setGoalToEdit(null)}
                />
            )}

            <AlertDialog open={!!goalToDelete} onOpenChange={(open) => !open && setGoalToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the goal {'"'}
                        <span className="capitalize font-semibold">{goalToDelete?.name}</span>
                        {'"'}.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setGoalToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </FinTrackLayout>
    );
}
