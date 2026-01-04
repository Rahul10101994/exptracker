"use client";

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FinTrackLayout } from '@/components/fintrack/fintrack-layout';
import { useBudget } from '@/contexts/budget-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useTransactions } from '@/contexts/transactions-context';
import { toast } from '@/hooks/use-toast';

type LocalBudgets = {
    [category: string]: {
        amount: number;
    };
};

export default function BudgetPage() {
    const { budgets, setBudgets, addCategory, getCategoryProgress } = useBudget();
    const { getIconForCategory } = useTransactions();
    const [newCategory, setNewCategory] = React.useState('');
    const [localBudgets, setLocalBudgets] = React.useState<LocalBudgets>(budgets);

    React.useEffect(() => {
        setLocalBudgets(budgets);
    }, [budgets]);

    const handleAddCategory = () => {
        if (newCategory.trim()) {
            addCategory(newCategory.trim());
            setNewCategory('');
        }
    };
    
    const totalBudget = React.useMemo(() => {
        return Object.values(localBudgets).reduce((sum, budget) => sum + (budget.amount || 0), 0);
    }, [localBudgets]);

    const handleBudgetChange = (category: string, amount: number) => {
        setLocalBudgets(prev => ({
            ...prev,
            [category]: { amount }
        }));
    };

    const handleSave = () => {
        setBudgets(localBudgets);
        toast({
            title: "Budgets Saved",
            description: "Your new budget amounts have been saved successfully.",
        });
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
                <h1 className="text-lg font-bold text-foreground mx-auto">Manage Budget</h1>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <PlusCircle />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Add New Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter the name for the new budget category.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Input 
                            placeholder="e.g. Entertainment"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                        />
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAddCategory}>Add</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </header>

            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">${totalBudget.toFixed(2)}</p>
                </CardContent>
            </Card>

            <div className="space-y-4 pb-16">
                {Object.entries(localBudgets).map(([category, budget]) => {
                    const Icon = getIconForCategory(category);
                    const { spent, percentage } = getCategoryProgress(category);
                    
                    return (
                        <Card key={category}>
                            <CardHeader className="p-2 pb-1 flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle className="text-base capitalize">{category}</CardTitle>

                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <span className={percentage > 100 ? 'text-destructive' : ''}>
                                        ${spent.toFixed(2)}
                                    </span>
                                     / ${budget.amount.toFixed(2)}
                                </div>
                            </CardHeader>
                            <CardContent className="p-2 pt-0">
                               <div className='relative'>
                                 <div 
                                     className="absolute top-0 left-0 h-2 rounded-full bg-primary"
                                     style={{ width: `${Math.min(percentage, 100)}%`, transition: 'width 0.3s' }}
                                 ></div>
                                 {percentage > 100 && (
                                     <div 
                                         className="absolute top-0 left-0 h-2 rounded-full bg-destructive"
                                         style={{ width: `${Math.min(percentage - 100, 100)}%`, transition: 'width 0.3s' }}
                                     ></div>
                                 )}
                                 <div className="h-2 w-full rounded-full bg-primary/20"></div>
                               </div>
                                <div className="mt-2">
                                    <Label htmlFor={`budget-${category}`} className="sr-only">Set Budget for {category}</Label>
                                    <Input
                                        id={`budget-${category}`}
                                        type="number"
                                        placeholder="Set Budget"
                                        value={budget.amount === 0 ? '' : budget.amount}
                                        onChange={(e) => handleBudgetChange(category, parseFloat(e.target.value) || 0)}
                                        className="text-right h-8"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
            <div className='fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-sm px-4'>
                <Button onClick={handleSave} className="w-full">Save Changes</Button>
            </div>
        </FinTrackLayout>
    );
}
