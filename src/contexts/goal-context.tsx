
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useTransactions } from './transactions-context';

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
        createdAt: new Date().toISOString(),
    },
    {
        id: 'g2',
        name: 'Monthly Savings',
        targetAmount: 500,
        savedAmount: 0, // This will be calculated from transactions
        type: 'monthly',
        createdAt: new Date().toISOString(),
    }
];

export const GoalProvider = ({ children }: { children: ReactNode }) => {
    const [goals, setGoals] = useState<Goal[]>(initialGoals);
    const { currentMonthTransactions } = useTransactions();

    const addGoal = (goal: NewGoal) => {
        const newGoal: Goal = {
            id: `${goal.name}-${Date.now()}-${Math.random()}`,
            ...goal,
            savedAmount: 0,
            createdAt: new Date().toISOString(),
        };
        setGoals(prev => [...prev, newGoal]);
    };
    
    const getGoalProgress = (goal: Goal) => {
        let saved = goal.savedAmount;
        if (goal.type === 'monthly') {
             const income = currentMonthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
            const expense = currentMonthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            saved = income - expense;
        }

        const progress = goal.targetAmount > 0 ? (saved / goal.targetAmount) * 100 : 0;
        
        return { progress, saved };
    };

    return (
        <GoalContext.Provider value={{ goals, addGoal, getGoalProgress }}>
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
