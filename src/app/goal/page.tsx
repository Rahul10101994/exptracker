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


export default function GoalPage() {
    const { goals } = useGoals();
    const [isMonthlyOpen, setIsMonthlyOpen] = React.useState(true);
    const [isYearlyOpen, setIsYearlyOpen] = React.useState(true);
    const [isLongTermOpen, setIsLongTermOpen] = React.useState(true);
    
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
                           {!isMonthlyOpen && <GoalCard goal={monthlyGoals[0]} />}
                            <Collapsible.Content className="space-y-4">
                                {monthlyGoals.slice(1).map(goal => <GoalCard key={goal.id} goal={goal} />)}
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
                           {!isYearlyOpen && <GoalCard goal={yearlyGoals[0]} />}
                           <Collapsible.Content className="space-y-4">
                               {yearlyGoals.slice(1).map(goal => <GoalCard key={goal.id} goal={goal} />)}
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
                            {!isLongTermOpen && <GoalCard goal={longTermGoals[0]} />}
                            <Collapsible.Content className="space-y-4">
                                {longTermGoals.slice(1).map(goal => <GoalCard key={goal.id} goal={goal} />)}
                            </Collapsible.Content>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            No long-term goals set.
                        </div>
                    )}
                </Collapsible.Root>
            </div>

        </FinTrackLayout>
    );
}
