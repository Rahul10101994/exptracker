
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useTransactions } from './transactions-context';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';

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
    investments: Budgets;
}

interface BudgetContextType {
    expenseBudgets: Budgets;
    incomeBudgets: Budgets;
    investmentBudgets: Budgets;
    setExpenseBudgets: (budgets: Budgets) => Promise<void>;
    setIncomeBudgets: (budgets: Budgets) => Promise<void>;
    setInvestmentBudgets: (budgets: Budgets) => Promise<void>;
    addExpenseCategory: (category: string) => Promise<void>;
    deleteExpenseCategory: (category: string) => Promise<void>;
    addIncomeCategory: (category: string) => Promise<void>;
    deleteIncomeCategory: (category: string) => Promise<void>;
    addInvestmentCategory: (category: string) => Promise<void>;
    deleteInvestmentCategory: (category: string) => Promise<void>;
    getCategoryProgress: (category: string, type: 'expense' | 'income' | 'investment') => { spent?: number; earned?: number; percentage: number };
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const initialBudgets: BudgetsData = {
    expenses: {
        food: { amount: 500 },
        transport: { amount: 150 },
        shopping: { amount: 300 },
        bills: { amount: 200 },
        subscription: { amount: 50 },
        other: { amount: 100 },
    },
    income: {
        "Freelance": { amount: 2000 },
        "Salary": { amount: 50000 },
        "Bonus": { amount: 0 },
        "Other": { amount: 100 },
    },
    investments: {
        "Stocks": { amount: 8000 },
        "Mutual Funds": { amount: 5000 },
    }
};

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
    const { currentMonthTransactions } = useTransactions();
    const [expenseBudgets, setExpenseBudgetsState] = useState<Budgets>(initialBudgets.expenses);
    const [incomeBudgets, setIncomeBudgetsState] = useState<Budgets>(initialBudgets.income);
    const [investmentBudgets, setInvestmentBudgetsState] = useState<Budgets>(initialBudgets.investments);
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
                    setInvestmentBudgetsState(data.investments || {});
                } else {
                    setDoc(budgetDocRef, initialBudgets);
                    setExpenseBudgetsState(initialBudgets.expenses);
                    setIncomeBudgetsState(initialBudgets.income);
                    setInvestmentBudgetsState(initialBudgets.investments);
                }
            });
            return () => unsubscribe();
        } else {
            setExpenseBudgetsState(initialBudgets.expenses);
            setIncomeBudgetsState(initialBudgets.income);
            setInvestmentBudgetsState(initialBudgets.investments);
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

    const setInvestmentBudgets = async (newBudgets: Budgets) => {
        setInvestmentBudgetsState(newBudgets); // Optimistic update
        await saveData({ investments: newBudgets });
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
    
    const deleteExpenseCategory = async (categoryToDelete: string) => {
        if (!firestore || !userContext?.user) return;
        const keyToDelete = Object.keys(expenseBudgets).find(k => k.toLowerCase() === categoryToDelete.toLowerCase());
        if (keyToDelete) {
            const newBudgets = { ...expenseBudgets };
            delete newBudgets[keyToDelete];
            setExpenseBudgetsState(newBudgets);

            const budgetDocRef = doc(firestore, 'users', userContext.user.uid, 'budgets', 'main');
            await updateDoc(budgetDocRef, {
                [`expenses.${keyToDelete}`]: deleteField()
            });
        }
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

    const deleteIncomeCategory = async (categoryToDelete: string) => {
        if (!firestore || !userContext?.user) return;
        const keyToDelete = Object.keys(incomeBudgets).find(k => k.toLowerCase() === categoryToDelete.toLowerCase());
        if (keyToDelete) {
            const newBudgets = { ...incomeBudgets };
            delete newBudgets[keyToDelete];
            setIncomeBudgetsState(newBudgets);

            const budgetDocRef = doc(firestore, 'users', userContext.user.uid, 'budgets', 'main');
            await updateDoc(budgetDocRef, {
                [`income.${keyToDelete}`]: deleteField()
            });
        }
    };

    const addInvestmentCategory = async (category: string) => {
        const titleCaseCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
        const existingKey = Object.keys(investmentBudgets).find(k => k.toLowerCase() === titleCaseCategory.toLowerCase());
        if (!existingKey) {
            const newBudgets = {
                ...investmentBudgets,
                [titleCaseCategory]: { amount: 0 }
            };
            await setInvestmentBudgets(newBudgets);
        }
    };
    
    const deleteInvestmentCategory = async (categoryToDelete: string) => {
        if (!firestore || !userContext?.user) return;
        const keyToDelete = Object.keys(investmentBudgets).find(k => k.toLowerCase() === categoryToDelete.toLowerCase());
        if (keyToDelete) {
            const newBudgets = { ...investmentBudgets };
            delete newBudgets[keyToDelete];
            setInvestmentBudgetsState(newBudgets);

            const budgetDocRef = doc(firestore, 'users', userContext.user.uid, 'budgets', 'main');
            await updateDoc(budgetDocRef, {
                [`investments.${keyToDelete}`]: deleteField()
            });
        }
    };

    const getCategoryProgress = (category: string, type: 'expense' | 'income' | 'investment') => {
        if (type === 'income') {
            const budgetAmount = incomeBudgets[category]?.amount || 0;
            const earned = currentMonthTransactions
                .filter(t => t.type === 'income' && t.category.toLowerCase() === category.toLowerCase())
                .reduce((sum, t) => sum + t.amount, 0);
            const percentage = budgetAmount > 0 ? (earned / budgetAmount) * 100 : 0;
            return { earned, percentage };
        } 

        if (type === 'investment') {
            const budgetAmount = investmentBudgets[category]?.amount || 0;
            const spent = currentMonthTransactions
                .filter(t => t.type === 'investment' && t.category.toLowerCase() === category.toLowerCase())
                .reduce((sum, t) => sum + t.amount, 0);
            const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
            return { spent, percentage };
        }
        
        // else it's expense
        const budgetAmount = expenseBudgets[category]?.amount || 0;
        const spent = currentMonthTransactions
            .filter(t => t.type === 'expense' && t.category.toLowerCase() === category.toLowerCase())
            .reduce((sum, t) => sum + t.amount, 0);
        
        const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

        return { spent, percentage };
    };

    return (
        <BudgetContext.Provider value={{ 
            expenseBudgets, 
            incomeBudgets,
            investmentBudgets,
            setExpenseBudgets, 
            setIncomeBudgets,
            setInvestmentBudgets,
            addExpenseCategory, 
            deleteExpenseCategory,
            addIncomeCategory,
            deleteIncomeCategory, 
            addInvestmentCategory,
            deleteInvestmentCategory,
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
