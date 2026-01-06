
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useTransactions } from './transactions-context';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

type Budget = {
    amount: number;
};

type Budgets = {
    [category: string]: Budget;
};

interface BudgetContextType {
    budgets: Budgets;
    setBudgets: (budgets: Budgets) => Promise<void>;
    addCategory: (category: string) => Promise<void>;
    deleteCategory: (category: string) => Promise<void>;
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
    const [budgets, setBudgetsState] = useState<Budgets>(initialBudgets);
    const userContext = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        if (firestore && userContext?.user) {
            const budgetDocRef = doc(firestore, 'users', userContext.user.uid, 'budgets', 'main');
            const unsubscribe = onSnapshot(budgetDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setBudgetsState(docSnap.data() as Budgets);
                } else {
                    // If no budget doc exists, create one with initial values
                    setDoc(budgetDocRef, initialBudgets);
                    setBudgetsState(initialBudgets);
                }
            });
            return () => unsubscribe();
        } else {
            setBudgetsState(initialBudgets);
        }
    }, [firestore, userContext]);

    const setBudgets = async (newBudgets: Budgets) => {
        setBudgetsState(newBudgets); // Optimistic update
        if (firestore && userContext?.user) {
            const budgetDocRef = doc(firestore, 'users', userContext.user.uid, 'budgets', 'main');
            await setDoc(budgetDocRef, newBudgets);
        }
    };
    
    const addCategory = async (category: string) => {
        const lowerCaseCategory = category.toLowerCase();
        if (!budgets[lowerCaseCategory]) {
            const newBudgets = {
                ...budgets,
                [lowerCaseCategory]: { amount: 0 }
            };
            await setBudgets(newBudgets);
        }
    };
    
    const deleteCategory = async (category: string) => {
        const lowerCaseCategory = category.toLowerCase();
        const newBudgets = { ...budgets };
        delete newBudgets[lowerCaseCategory];
        await setBudgets(newBudgets);
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
        <BudgetContext.Provider value={{ budgets, setBudgets, addCategory, deleteCategory, getCategoryProgress }}>
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
