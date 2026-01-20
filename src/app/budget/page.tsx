
"use client";

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

type LocalBudgets = {
    [category: string]: {
        amount: number;
    };
};

export default function BudgetPage() {
    const { 
        expenseBudgets, 
        incomeBudgets,
        setExpenseBudgets,
        setIncomeBudgets, 
        addExpenseCategory, 
        deleteExpenseCategory, 
        addIncomeCategory, 
        deleteIncomeCategory,
        getCategoryProgress 
    } = useBudget();

    const { getIconForCategory } = useTransactions();
    const [newCategory, setNewCategory] = React.useState('');
    const [newCategoryType, setNewCategoryType] = React.useState<'expense' | 'income'>('expense');
    
    const [localExpenseBudgets, setLocalExpenseBudgets] = React.useState<LocalBudgets>({});
    const [localIncomeBudgets, setLocalIncomeBudgets] = React.useState<LocalBudgets>({});
    const [categoryToDelete, setCategoryToDelete] = React.useState<{name: string, type: 'expense' | 'income'} | null>(null);
    const [isClient, setIsClient] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    React.useEffect(() => {
        setLocalExpenseBudgets(JSON.parse(JSON.stringify(expenseBudgets)));
    }, [expenseBudgets]);

    React.useEffect(() => {
        setLocalIncomeBudgets(JSON.parse(JSON.stringify(incomeBudgets)));
    }, [incomeBudgets]);

    const handleAddCategory = async () => {
        if (newCategory.trim()) {
            if (newCategoryType === 'expense') {
                await addExpenseCategory(newCategory.trim());
            } else {
                await addIncomeCategory(newCategory.trim());
            }
            setNewCategory('');
        }
    };
    
    const handleDeleteCategory = async () => {
        if (categoryToDelete) {
            if (categoryToDelete.type === 'expense') {
                await deleteExpenseCategory(categoryToDelete.name);
            } else {
                await deleteIncomeCategory(categoryToDelete.name);
            }
            toast({
                title: "Category Deleted",
                description: `The "${categoryToDelete.name}" category has been deleted.`,
            });
            setCategoryToDelete(null);
        }
    };

    const totalExpenseBudget = React.useMemo(() => {
        return Object.values(localExpenseBudgets).reduce((sum, budget) => sum + (budget.amount || 0), 0);
    }, [localExpenseBudgets]);

    const totalIncomeBudget = React.useMemo(() => {
        return Object.values(localIncomeBudgets).reduce((sum, budget) => sum + (budget.amount || 0), 0);
    }, [localIncomeBudgets]);

    const handleExpenseBudgetChange = (category: string, amount: number) => {
        setLocalExpenseBudgets(prev => ({
            ...prev,
            [category]: { amount }
        }));
    };

    const handleIncomeBudgetChange = (category: string, amount: number) => {
        setLocalIncomeBudgets(prev => ({
            ...prev,
            [category]: { amount }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        await Promise.all([
            setExpenseBudgets(localExpenseBudgets),
            setIncomeBudgets(localIncomeBudgets)
        ]);
        setIsSaving(false);
        toast({
            title: "Budgets Saved",
            description: "Your new budget amounts have been saved successfully.",
        });
    };
    
    const openAddCategoryDialog = (type: 'expense' | 'income') => {
        setNewCategoryType(type);
        const trigger = document.getElementById('add-category-trigger');
        trigger?.click();
    }

    return (
        <FinTrackLayout>
            <header className="flex items-center pt-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="text-lg font-bold text-foreground mx-auto">Manage Budgets</h1>
                 <div className="w-10"></div>
            </header>

            <div className="space-y-6 pb-24">
                {/* ---------- EXPENSE BUDGETS ---------- */}
                <div>
                    <div className='flex justify-between items-center mb-2'>
                        <h2 className='text-base font-semibold'>Expense Budgets</h2>
                        <Button variant="ghost" size="icon" onClick={() => openAddCategoryDialog('expense')}>
                            <PlusCircle className='h-5 w-5' />
                        </Button>
                    </div>
                    <Card className="text-center">
                        <CardHeader className="p-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expense Budget</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <p className="text-3xl font-bold">₹{totalExpenseBudget.toFixed(2)}</p>
                        </CardContent>
                    </Card>

                    <div className="space-y-4 mt-4">
                        {isClient && localExpenseBudgets && Object.entries(localExpenseBudgets).map(([category, budget]) => {
                            const Icon = getIconForCategory(category);
                            const { spent, percentage } = getCategoryProgress(category, 'expense');
                            
                            return (
                                <Card key={category}>
                                    <CardHeader className="p-2 pb-1 flex-row items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded-md">
                                                <Icon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <CardTitle className="text-base capitalize">{category}</CardTitle>
                                             <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => setCategoryToDelete({ name: category, type: 'expense' })}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <span className={percentage > 100 ? 'text-destructive' : ''}>
                                                ₹{(spent ?? 0).toFixed(2)}
                                            </span>
                                             / ₹{budget.amount.toFixed(2)}
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
                                                onChange={(e) => handleExpenseBudgetChange(category, parseFloat(e.target.value) || 0)}
                                                className="text-right h-8"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                <Separator />

                {/* ---------- INCOME BUDGETS ---------- */}
                <div>
                     <div className='flex justify-between items-center mb-2'>
                        <h2 className='text-base font-semibold'>Income Budgets</h2>
                        <Button variant="ghost" size="icon" onClick={() => openAddCategoryDialog('income')}>
                            <PlusCircle className='h-5 w-5'/>
                        </Button>
                    </div>
                    <Card className="text-center">
                        <CardHeader className="p-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income Target</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <p className="text-3xl font-bold">₹{totalIncomeBudget.toFixed(2)}</p>
                        </CardContent>
                    </Card>

                    <div className="space-y-4 mt-4">
                        {isClient && localIncomeBudgets && Object.entries(localIncomeBudgets).map(([category, budget]) => {
                            const Icon = getIconForCategory(category);
                            const { earned, percentage } = getCategoryProgress(category, 'income');
                            
                            return (
                                <Card key={category}>
                                    <CardHeader className="p-2 pb-1 flex-row items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded-md">
                                                <Icon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <CardTitle className="text-base capitalize">{category}</CardTitle>
                                             <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => setCategoryToDelete({ name: category, type: 'income' })}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <span className="text-green-600">
                                                ₹{(earned ?? 0).toFixed(2)}
                                            </span>
                                             / ₹{budget.amount.toFixed(2)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-2 pt-0">
                                       <div className='relative'>
                                         <div 
                                             className="absolute top-0 left-0 h-2 rounded-full bg-green-500"
                                             style={{ width: `${Math.min(percentage, 100)}%`, transition: 'width 0.3s' }}
                                         ></div>
                                         <div className="h-2 w-full rounded-full bg-green-500/20"></div>
                                       </div>
                                        <div className="mt-2">
                                            <Label htmlFor={`income-budget-${category}`} className="sr-only">Set Target for {category}</Label>
                                            <Input
                                                id={`income-budget-${category}`}
                                                type="number"
                                                placeholder="Set Target"
                                                value={budget.amount === 0 ? '' : budget.amount}
                                                onChange={(e) => handleIncomeBudgetChange(category, parseFloat(e.target.value) || 0)}
                                                className="text-right h-8"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                <div className='mt-4'>
                    <Button onClick={handleSave} className="w-full" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save All Budgets'}
                    </Button>
                </div>
            </div>

            <AlertDialog>
                {/* This trigger is hidden and is activated programmatically */}
                <AlertDialogTrigger asChild id="add-category-trigger">
                    <Button variant="ghost" size="icon" className="hidden">
                        <PlusCircle />
                    </Button>
                </AlertDialogTrigger>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Add New {newCategoryType} Category</AlertDialogTitle>
                    <AlertDialogDescription>
                        Enter the name for the new category.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input 
                        placeholder="e.g. Side Hustle"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleAddCategory}>Add</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the category {'"'}
                        <span className="capitalize font-semibold">{categoryToDelete?.name}</span>
                        {'"'}.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </FinTrackLayout>
    );
}
