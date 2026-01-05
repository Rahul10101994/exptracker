
"use client";

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FinTrackLayout } from '@/components/fintrack/fintrack-layout';
import { useTransactions } from '@/contexts/transactions-context';
import { useBudget } from '@/contexts/budget-context';
import { IconPicker } from '@/components/fintrack/icon-picker';
import { toast } from '@/hooks/use-toast';

export default function CategoriesPage() {
    const { getIconForCategory, updateCategoryIcon, getCategoryIconName } = useTransactions();
    const { budgets } = useBudget();
    const [editingCategory, setEditingCategory] = React.useState<string | null>(null);

    const categories = React.useMemo(() => {
        const allCategories = new Set(Object.keys(budgets));
        // You might want to add categories from transactions as well if they don't have a budget
        // For now, we'll stick to budgeted categories.
        return Array.from(allCategories);
    }, [budgets]);

    const handleIconSelect = (iconName: string) => {
        if (editingCategory) {
            updateCategoryIcon(editingCategory, iconName);
            toast({
                title: 'Icon Updated',
                description: `The icon for "${editingCategory}" has been changed.`,
            });
        }
        setEditingCategory(null);
    };

    return (
        <FinTrackLayout>
            <header className="flex items-center pt-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings">
                        <ArrowLeft />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="text-lg font-bold text-foreground mx-auto">Category Icons</h1>
                <div className="w-10"></div>
            </header>

            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {categories.map((category) => {
                            const Icon = getIconForCategory(category);
                            const iconName = getCategoryIconName(category);
                            return (
                                <div key={category} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted">
                                            <Icon className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-semibold capitalize">{category}</p>
                                            <p className="text-sm text-muted-foreground">{iconName}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setEditingCategory(category)}>
                                        Change
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <IconPicker
                isOpen={!!editingCategory}
                onClose={() => setEditingCategory(null)}
                onSelectIcon={handleIconSelect}
            />
        </FinTrackLayout>
    );
}
