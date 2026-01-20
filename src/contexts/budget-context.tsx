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

// This is the new data structure for what's stored in Firestore
interface BudgetsData {
    expenses: Budgets;
    income: Budgets;
}

interface BudgetContextType {
    expenseBudgets: Budgets;
    incomeBudgets: Budgets;
    setExpenseBudgets: (budgets: Budgets) => Promise<void>;
    setIncomeBudgets: (budgets: Budgets) => Promise<void>;
    addExpenseCategory: (category: string) => Promise<void>;
    deleteExpenseCategory: (category: string) => Promise<void>;
    addIncomeCategory: (category: string) => Promise<void>;
    deleteIncomeCategory: (category: string) => Promise<void>;
    getCategoryProgress: (category: string, type: 'expense' | 'income') => { spent?: number; earned?: number; percentage: number };
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const initialBudgets: BudgetsData = {
    expenses: {
        food: { amount: 500 },
        transport: { amount: 150 },
        shopping: { amount: 300 },
        bills: { amount: 200 },
        subscription: { amount: 50 },
        investment: { amount: 8000 },
        other: { amount: 100 },
    },
    income: {
        "Freelance": { amount: 2000 },
        "Salary": { amount: 50000 },
        "Bonus": { amount: 0 },
        "Other": { amount: 100 },
    }
};

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
    const { currentMonthTransactions } = useTransactions();
    const [expenseBudgets, setExpenseBudgetsState] = useState<Budgets>(initialBudgets.expenses);
    const [incomeBudgets, setIncomeBudgetsState] = useState<Budgets>(initialBudgets.income);
    const userContext = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        if (firestore && userContext?.user) {
            const budgetDocRef = doc(firestore, 'users', userContext.user.uid, 'budgets', 'main');
            const unsubscribe = onSnapshot(budgetDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data() as BudgetsData;
                    setExpenseBudgetsState(data.expenses || {});
                    setIncomeBudgetsState(data.income || {});
                } else {
                    setDoc(budgetDocRef, initialBudgets);
                    setExpenseBudgetsState(initialBudgets.expenses);
                    setIncomeBudgetsState(initialBudgets.income);
                }
            });
            return () => unsubscribe();
        } else {
            setExpenseBudgetsState(initialBudgets.expenses);
            setIncomeBudgetsState(initialBudgets.income);
        }
    }, [firestore, userContext]);

    const saveData = async (data: Partial<BudgetsData>) => {
        if (firestore && userContext?.user) {
            const budgetDocRef = doc(firestore, 'users', userContext.user.uid, 'budgets', 'main');
            await setDoc(budgetDocRef, data, { merge: true });
        }
    };

    const setExpenseBudgets = async (newBudgets: Budgets) => {
        setExpenseBudgetsState(newBudgets); // Optimistic update
        await saveData({ expenses: newBudgets });
    };

    const setIncomeBudgets = async (newBudgets: Budgets) => {
        setIncomeBudgetsState(newBudgets); // Optimistic update
        await saveData({ income: newBudgets });
    };
    
    const addExpenseCategory = async (category: string) => {
        const lowerCaseCategory = category.toLowerCase();
        if (!expenseBudgets[lowerCaseCategory]) {
            const newBudgets = {
                ...expenseBudgets,
                [lowerCaseCategory]: { amount: 0 }
            };
            await setExpenseBudgets(newBudgets);
        }
    };
    
    const deleteExpenseCategory = async (category: string) => {
        const lowerCaseCategory = category.toLowerCase();
        const newBudgets = { ...expenseBudgets };
        delete newBudgets[lowerCaseCategory];
        await setExpenseBudgets(newBudgets);
    };

    const addIncomeCategory = async (category: string) => {
        const titleCaseCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
        const existingKey = Object.keys(incomeBudgets).find(k => k.toLowerCase() === titleCaseCategory.toLowerCase());
        if (!existingKey) {
            const newIncomeBudgets = {
                ...incomeBudgets,
                [titleCaseCategory]: { amount: 0 }
            };
            await setIncomeBudgets(newIncomeBudgets);
        }
    };

    const deleteIncomeCategory = async (category: string) => {
        const newIncomeBudgets = { ...incomeBudgets };
        const keyToDelete = Object.keys(newIncomeBudgets).find(k => k.toLowerCase() === category.toLowerCase());
        if (keyToDelete) {
            delete newIncomeBudgets[keyToDelete];
            await setIncomeBudgets(newIncomeBudgets);
        }
    };

    const getCategoryProgress = (category: string, type: 'expense' | 'income') => {
        if (type === 'income') {
            const budgetAmount = incomeBudgets[category]?.amount || 0;
            const earned = currentMonthTransactions
                .filter(t => t.type === 'income' && t.category.toLowerCase() === category.toLowerCase())
                .reduce((sum, t) => sum + t.amount, 0);
            const percentage = budgetAmount > 0 ? (earned / budgetAmount) * 100 : 0;
            return { earned, percentage };
        } 
        // else it's expense
        const budgetAmount = expenseBudgets[category]?.amount || 0;
        const spent = currentMonthTransactions
            .filter(t => 
                (t.type === 'expense' && t.category.toLowerCase() === category.toLowerCase()) ||
                (t.type === 'investment' && category.toLowerCase() === 'investment')
            )
            .reduce((sum, t) => sum + t.amount, 0);
        
        const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

        return { spent, percentage };
    };

    return (
        <BudgetContext.Provider value={{ 
            expenseBudgets, 
            incomeBudgets,
            setExpenseBudgets, 
            setIncomeBudgets,
            addExpenseCategory, 
            deleteExpenseCategory,
            addIncomeCategory,
            deleteIncomeCategory, 
            getCategoryProgress 
        }}>
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
