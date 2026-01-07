
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useTransactions } from './transactions-context';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

type Budget = {
    amount: number;
};

type Budgets = {
    [category: string]: Budget;
};

type IncomeCategories = string[];

interface BudgetsData {
    expenses: Budgets;
    income: IncomeCategories;
}

interface BudgetContextType {
    expenseBudgets: Budgets;
    incomeCategories: IncomeCategories;
    setExpenseBudgets: (budgets: Budgets) => Promise<void>;
    addExpenseCategory: (category: string) => Promise<void>;
    deleteExpenseCategory: (category: string) => Promise<void>;
    addIncomeCategory: (category: string) => Promise<void>;
    deleteIncomeCategory: (category: string) => Promise<void>;
    getCategoryProgress: (category: string) => { spent: number; percentage: number };
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
    income: ["Freelance", "Salary", "Bonus", "Other"]
};

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
    const { currentMonthTransactions } = useTransactions();
    const [expenseBudgets, setExpenseBudgetsState] = useState<Budgets>(initialBudgets.expenses);
    const [incomeCategories, setIncomeCategoriesState] = useState<IncomeCategories>(initialBudgets.income);
    const userContext = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        if (firestore && userContext?.user) {
            const budgetDocRef = doc(firestore, 'users', userContext.user.uid, 'budgets', 'main');
            const unsubscribe = onSnapshot(budgetDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data() as BudgetsData;
                    setExpenseBudgetsState(data.expenses || {});
                    setIncomeCategoriesState(data.income || []);
                } else {
                    setDoc(budgetDocRef, initialBudgets);
                    setExpenseBudgetsState(initialBudgets.expenses);
                    setIncomeCategoriesState(initialBudgets.income);
                }
            });
            return () => unsubscribe();
        } else {
            setExpenseBudgetsState(initialBudgets.expenses);
            setIncomeCategoriesState(initialBudgets.income);
        }
    }, [firestore, userContext]);

    const saveData = async (data: BudgetsData) => {
        if (firestore && userContext?.user) {
            const budgetDocRef = doc(firestore, 'users', userContext.user.uid, 'budgets', 'main');
            await setDoc(budgetDocRef, data);
        }
    };

    const setExpenseBudgets = async (newBudgets: Budgets) => {
        setExpenseBudgetsState(newBudgets); // Optimistic update
        await saveData({ expenses: newBudgets, income: incomeCategories });
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
        const newCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
        if (!incomeCategories.find(c => c.toLowerCase() === newCategory.toLowerCase())) {
            const newIncomeCategories = [...incomeCategories, newCategory];
            setIncomeCategoriesState(newIncomeCategories);
            await saveData({ expenses: expenseBudgets, income: newIncomeCategories });
        }
    };

    const deleteIncomeCategory = async (category: string) => {
        const newIncomeCategories = incomeCategories.filter(c => c.toLowerCase() !== category.toLowerCase());
        setIncomeCategoriesState(newIncomeCategories);
        await saveData({ expenses: expenseBudgets, income: newIncomeCategories });
    };

    const getCategoryProgress = (category: string) => {
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
            incomeCategories,
            setExpenseBudgets, 
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
