
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useTransactions } from './transactions-context';
import { cuid } from '@/lib/utils';

export type Goal = {
    id: string;
    name: string;
    targetAmount: number;
    savedAmount: number;
    type: 'monthly' | 'yearly' | 'long-term';
    createdAt: string;
};

export type NewGoal = Omit<Goal, 'id' | 'savedAmount' | 'createdAt'>;

interface GoalContextType {
    goals: Goal[];
    addGoal: (goal: NewGoal) => void;
    updateGoal: (id: string, goal: NewGoal) => void;
    deleteGoal: (id: string) => void;
    getGoalProgress: (goal: Goal) => { progress: number; saved: number };
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

const initialGoals: Goal[] = [
    {
        id: 'g1',
        name: 'Save for Vacation',
        targetAmount: 2000,
        savedAmount: 500,
        type: 'long-term',
        createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
        id: 'g2',
        name: 'Monthly Savings',
        targetAmount: 500,
        savedAmount: 0, // This will be calculated from transactions
        type: 'monthly',
        createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
        id: 'g3',
        name: 'Investment Portfolio',
        targetAmount: 2000,
        savedAmount: 0, // This will be calculated from transactions
        type: 'monthly',
        createdAt: "2024-01-01T00:00:00.000Z",
    }
];

export const GoalProvider = ({ children }: { children: ReactNode }) => {
    const [goals, setGoals] = useState<Goal[]>(initialGoals);
    const { transactions, currentMonthTransactions } = useTransactions();

    const addGoal = (goal: NewGoal) => {
        const newGoal: Goal = {
            id: cuid(),
            ...goal,
            savedAmount: 0,
            createdAt: new Date().toISOString(),
        };
        setGoals(prev => [...prev, newGoal]);
    };

    const updateGoal = (id: string, updatedData: NewGoal) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updatedData } : g));
    };

    const deleteGoal = (id: string) => {
        setGoals(prev => prev.filter(g => g.id !== id));
    };
    
    const getGoalProgress = (goal: Goal) => {
        let saved = goal.savedAmount;

        if (goal.name.toLowerCase().includes("investment")) {
            // Use current month's transactions for monthly investment goals
            if (goal.type === 'monthly') {
                 saved = currentMonthTransactions
                    .filter(t => t.category.toLowerCase() === 'investment')
                    .reduce((sum, t) => sum + t.amount, 0);
            } else {
                // Use all transactions for long-term/yearly investment goals
                saved = transactions
                    .filter(t => t.category.toLowerCase() === 'investment')
                    .reduce((sum, t) => sum + t.amount, 0);
            }
        } else if (goal.type === 'monthly') {
             const income = currentMonthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
            const expense = currentMonthTransactions
                .filter(t => t.type === 'expense' && t.category.toLowerCase() !== 'investment')
                .reduce((sum, t) => sum + t.amount, 0);
            saved = income - expense;
        }

        const progress = goal.targetAmount > 0 ? (saved / goal.targetAmount) * 100 : 0;
        
        return { progress, saved };
    };

    return (
        <GoalContext.Provider value={{ goals, addGoal, updateGoal, deleteGoal, getGoalProgress }}>
            {children}
        </GoalContext.Provider>
    );
};

export const useGoals = () => {
    const context = useContext(GoalContext);
    if (context === undefined) {
        throw new Error('useGoals must be used within a GoalProvider');
    }
    return context;
};
