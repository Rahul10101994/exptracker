"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useTransactions } from './transactions-context';

type Budget = {
    amount: number;
};

type Budgets = {
    [category: string]: Budget;
};

interface BudgetContextType {
    budgets: Budgets;
    setBudget: (category: string, amount: number) => void;
    addCategory: (category: string) => void;
    getCategoryProgress: (category: string) => { spent: number; percentage: number };
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const initialBudgets: Budgets = {
    food: { amount: 500 },
    transport: { amount: 150 },
    shopping: { amount: 300 },
    bills: { amount: 200 },
    subscription: { amount: 50 },
    other: { amount: 100 },
};

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
    const { currentMonthTransactions } = useTransactions();
    const [budgets, setBudgets] = useState<Budgets>(initialBudgets);

    const setBudget = (category: string, amount: number) => {
        setBudgets(prev => ({
            ...prev,
            [category.toLowerCase()]: { amount }
        }));
    };

    const addCategory = (category: string) => {
        const lowerCaseCategory = category.toLowerCase();
        if (!budgets[lowerCaseCategory]) {
            setBudgets(prev => ({
                ...prev,
                [lowerCaseCategory]: { amount: 0 }
            }));
        }
    };
    
    const getCategoryProgress = (category: string) => {
        const budgetAmount = budgets[category]?.amount || 0;
        const spent = currentMonthTransactions
            .filter(t => t.type === 'expense' && t.category.toLowerCase() === category.toLowerCase())
            .reduce((sum, t) => sum + t.amount, 0);
        
        const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

        return { spent, percentage };
    };

    return (
        <BudgetContext.Provider value={{ budgets, setBudget, addCategory, getCategoryProgress }}>
            {children}
        </BudgetContext.Provider>
    );
};

export const useBudget = () => {
    const context = useContext(BudgetContext);
    if (context === undefined) {
        throw new Error('useBudget must be used within a BudgetProvider');
    }
    return context;
};
