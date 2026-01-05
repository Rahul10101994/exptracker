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
    
    const monthlyGoals = goals.filter(g => g.type === 'monthly');
    const yearlyGoals = goals.filter(g => g.type === 'yearly');
    const longTermGoals = goals.filter(g => g.type === 'long-term');

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
                    <h2 className="text-base font-semibold mb-2">Monthly Goals</h2>
                    <div className="space-y-4">
                        {monthlyGoals.length > 0 ? (
                            monthlyGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
                        ) : (
                           <div className="text-center text-muted-foreground py-10">
                                No monthly goals set.
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-base font-semibold mb-2">Yearly Goals</h2>
                    <div className="space-y-4">
                        {yearlyGoals.length > 0 ? (
                            yearlyGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                No yearly goals set.
                            </div>
                        )}
                    </div>
                </div>
                 <div>
                    <h2 className="text-base font-semibold mb-2">Long Term Goals</h2>
                    <div className="space-y-4">
                        {longTermGoals.length > 0 ? (
                            longTermGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                No long-term goals set.
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </FinTrackLayout>
    );
}
