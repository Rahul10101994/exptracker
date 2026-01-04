"use client";

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinTrackLayout } from '@/components/fintrack/fintrack-layout';
import { useGoals } from '@/contexts/goal-context';
import { GoalCard } from '@/components/fintrack/goal-card';
import { AddGoalSheet } from '@/components/fintrack/add-goal-sheet';


export default function GoalPage() {
    const { goals } = useGoals();
    
    const recurringGoals = goals.filter(g => g.type === 'recurring');
    const nonRecurringGoals = goals.filter(g => g.type === 'non-recurring');

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
                <div>
                    <h2 className="text-base font-semibold mb-2">Recurring Goals</h2>
                    <div className="space-y-4">
                        {recurringGoals.length > 0 ? (
                            recurringGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
                        ) : (
                           <div className="text-center text-muted-foreground py-10">
                                No recurring goals set.
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-base font-semibold mb-2">Non-Recurring Goals</h2>
                    <div className="space-y-4">
                        {nonRecurringGoals.length > 0 ? (
                            nonRecurringGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                No non-recurring goals set.
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </FinTrackLayout>
    );
}
