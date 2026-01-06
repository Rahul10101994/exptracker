
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useTransactions } from './transactions-context';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query } from 'firebase/firestore';

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
    addGoal: (goal: NewGoal) => Promise<void>;
    updateGoal: (id: string, goal: NewGoal) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    getGoalProgress: (goal: Goal) => { progress: number; saved: number };
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const { transactions, currentMonthTransactions } = useTransactions();
    const userContext = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        if (firestore && userContext?.user) {
            const goalsCollection = collection(firestore, 'users', userContext.user.uid, 'goals');
            const q = query(goalsCollection);
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newGoals = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                } as Goal));
                setGoals(newGoals);
            });
            return () => unsubscribe();
        } else {
            setGoals([]);
        }
    }, [firestore, userContext]);

    const addGoal = async (goal: NewGoal) => {
        if (!firestore || !userContext?.user) return;
        const newGoal = {
            ...goal,
            savedAmount: 0,
            createdAt: new Date().toISOString(),
        };
        const goalsCollection = collection(firestore, 'users', userContext.user.uid, 'goals');
        await addDoc(goalsCollection, newGoal);
    };

    const updateGoal = async (id: string, updatedData: NewGoal) => {
        if (!firestore || !userContext?.user) return;
        const goalDoc = doc(firestore, 'users', userContext.user.uid, 'goals', id);
        await updateDoc(goalDoc, updatedData as any);
    };

    const deleteGoal = async (id: string) => {
        if (!firestore || !userContext?.user) return;
        const goalDoc = doc(firestore, 'users', userContext.user.uid, 'goals', id);
        await deleteDoc(goalDoc);
    };
    
    const getGoalProgress = (goal: Goal) => {
        let saved = goal.savedAmount || 0;

        if (goal.name.toLowerCase().includes("investment")) {
            if (goal.type === 'monthly') {
                 saved = currentMonthTransactions
                    .filter(t => t.category.toLowerCase() === 'investment')
                    .reduce((sum, t) => sum + t.amount, 0);
            } else {
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
