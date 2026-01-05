
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, FC } from 'react';
import { isSameMonth, isSameYear } from 'date-fns';
import { cuid } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

const { Music, ArrowUpCircle, Tv, ShoppingBag, Utensils, Bus, MoreHorizontal, Landmark } = LucideIcons;

export type Transaction = {
    id: string;
    type: 'income' | 'expense';
    name: string;
    amount: number;
    date: string;
    category: string;
    account: string;
    spendingType?: 'need' | 'want';
    fgColor: string;
    bgColor: string;
};

export type NewTransaction = Omit<Transaction, 'id' | 'fgColor' | 'bgColor'>;

interface TransactionsContextType {
    transactions: Transaction[];
    addTransaction: (transaction: NewTransaction) => void;
    deleteTransaction: (id: string) => void;
    updateTransaction: (id: string, transaction: NewTransaction) => void;
    getIconForCategory: (category: string) => React.ElementType;
    updateCategoryIcon: (category: string, iconName: string) => void;
    currentMonthTransactions: Transaction[];
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

const initialTransactions: Transaction[] = [
    // Incomes for current month
    {
        id: 'inc1', type: 'income', name: 'Monthly Salary', category: 'salary',
        date: new Date(new Date().setDate(1)).toISOString(), amount: 4000.00,
        account: 'bank', fgColor: 'text-transaction-income-fg', bgColor: 'bg-transaction-income-bg'
    },
    {
        id: 'inc2', type: 'income', name: 'Freelance Gig', category: 'freelance',
        date: new Date(new Date().setDate(15)).toISOString(), amount: 750.00,
        account: 'bank', fgColor: 'text-transaction-income-fg', bgColor: 'bg-transaction-income-bg'
    },
    {
        id: 'inc3', type: 'income', name: 'Performance Bonus', category: 'bonus',
        date: new Date(new Date().setDate(20)).toISOString(), amount: 500.00,
        account: 'bank', fgColor: 'text-transaction-income-fg', bgColor: 'bg-transaction-income-bg'
    },
    {
        id: 'inc4', type: 'income', name: 'Sold old chair', category: 'other',
        date: new Date(new Date().setDate(18)).toISOString(), amount: 80.00,
        account: 'cash', fgColor: 'text-transaction-income-fg', bgColor: 'bg-transaction-income-bg'
    },

    // Expenses for current month
    {
        id: 'exp1', type: 'expense', name: 'Weekly Groceries', category: 'food',
        date: new Date(new Date().setDate(2)).toISOString(), amount: 120.50,
        account: 'card', spendingType: 'need', fgColor: 'text-orange-500', bgColor: 'bg-orange-100'
    },
    {
        id: 'exp2', type: 'expense', name: 'Monthly Metro Pass', category: 'transport',
        date: new Date(new Date().setDate(3)).toISOString(), amount: 85.00,
        account: 'card', spendingType: 'need', fgColor: 'text-green-500', bgColor: 'bg-green-100'
    },
    {
        id: 'exp3', type: 'expense', name: 'New Jacket', category: 'shopping',
        date: new Date(new Date().setDate(5)).toISOString(), amount: 150.00,
        account: 'card', spendingType: 'want', fgColor: 'text-blue-500', bgColor: 'bg-blue-100'
    },
    {
        id: 'exp4', type: 'expense', name: 'Electricity Bill', category: 'bills',
        date: new Date(new Date().setDate(10)).toISOString(), amount: 75.80,
        account: 'bank', spendingType: 'need', fgColor: 'text-purple-500', bgColor: 'bg-purple-100'
    },
    {
        id: 'exp5', type: 'expense', name: 'Spotify', category: 'subscription',
        date: new Date(new Date().setDate(12)).toISOString(), amount: 12.99,
        account: 'card', spendingType: 'want', fgColor: 'text-transaction-spotify-fg', bgColor: 'bg-transaction-spotify-bg'
    },
    {
        id: 'exp6', type: 'expense', name: 'Vanguard ETF', category: 'investment',
        date: new Date(new Date().setDate(16)).toISOString(), amount: 500.00,
        account: 'bank', spendingType: 'want', fgColor: 'text-indigo-500', bgColor: 'bg-indigo-100'
    },
    {
        id: 'exp7', type: 'expense', name: 'Cinema Tickets', category: 'other',
        date: new Date(new Date().setDate(22)).toISOString(), amount: 30.00,
        account: 'cash', spendingType: 'want', fgColor: 'text-gray-500', bgColor: 'bg-gray-100'
    },
    {
        id: 'exp8', type: 'expense', name: 'Dinner with friends', category: 'food',
        date: new Date(new Date().setDate(23)).toISOString(), amount: 65.00,
        account: 'card', spendingType: 'want', fgColor: 'text-orange-500', bgColor: 'bg-orange-100'
    },
    {
        id: 'exp9', type: 'expense', name: 'Netflix', category: 'subscription',
        date: new Date(new Date().setDate(25)).toISOString(), amount: 15.99,
        account: 'card', spendingType: 'want', fgColor: 'text-transaction-netflix-fg', bgColor: 'bg-transaction-netflix-bg'
    },

    // Transactions for previous month
    {
        id: 'prev_inc1', type: 'income', name: 'Previous Month Salary', category: 'salary',
        date: new Date(new Date().setMonth(new Date().getMonth() - 1, 1)).toISOString(), amount: 4000.00,
        account: 'bank', fgColor: 'text-transaction-income-fg', bgColor: 'bg-transaction-income-bg'
    },
    {
        id: 'prev_exp1', type: 'expense', name: 'Rent', category: 'bills',
        date: new Date(new Date().setMonth(new Date().getMonth() - 1, 1)).toISOString(), amount: 1200.00,
        account: 'bank', spendingType: 'need', fgColor: 'text-purple-500', bgColor: 'bg-purple-100'
    }
];

const categoryStyles: { [key: string]: { fgColor: string, bgColor: string } } = {
    subscription: { fgColor: 'text-transaction-spotify-fg', bgColor: 'bg-transaction-spotify-bg' },
    freelance: { fgColor: 'text-transaction-income-fg', bgColor: 'bg-transaction-income-bg' },
    shopping: { fgColor: 'text-blue-500', bgColor: 'bg-blue-100' },
    food: { fgColor: 'text-orange-500', bgColor: 'bg-orange-100' },
    transport: { fgColor: 'text-green-500', bgColor: 'bg-green-100' },
    income: { fgColor: 'text-transaction-income-fg', bgColor: 'bg-transaction-income-bg' },
    salary: { fgColor: 'text-transaction-income-fg', bgColor: 'bg-transaction-income-bg' },
    bonus: { fgColor: 'text-transaction-income-fg', bgColor: 'bg-transaction-income-bg' },
    bills: { fgColor: 'text-purple-500', bgColor: 'bg-purple-100' },
    investment: { fgColor: 'text-indigo-500', bgColor: 'bg-indigo-100' },
    other: { fgColor: 'text-gray-500', bgColor: 'bg-gray-100' },
};

const initialCategoryIcons: { [key: string]: string } = {
    subscription: 'Music',
    freelance: 'ArrowUpCircle',
    income: 'ArrowUpCircle',
    salary: 'ArrowUpCircle',
    bonus: 'ArrowUpCircle',
    shopping: 'ShoppingBag',
    food: 'Utensils',
    transport: 'Bus',
    bills: 'Tv',
    investment: 'Landmark',
    other: 'MoreHorizontal'
};


export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>(() => 
        initialTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    const [categoryIcons, setCategoryIcons] = useState<{ [key: string]: string }>(initialCategoryIcons);
    const [isClient, setIsClient] = useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const addTransaction = (transaction: NewTransaction) => {
        const styles = categoryStyles[transaction.category.toLowerCase()] || categoryStyles.other;
        const newTransaction: Transaction = {
            id: cuid(),
            ...transaction,
            date: transaction.date.toISOString(),
            ...styles
        };
        setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const deleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const updateTransaction = (id: string, updatedData: NewTransaction) => {
        const styles = categoryStyles[updatedData.category.toLowerCase()] || categoryStyles.other;
        setTransactions(prev => prev.map(t => 
            t.id === id 
            ? { 
                ...t, 
                ...updatedData,
                date: updatedData.date.toISOString(),
                ...styles 
              } 
            : t
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const updateCategoryIcon = (category: string, iconName: string) => {
        setCategoryIcons(prev => ({
            ...prev,
            [category.toLowerCase()]: iconName
        }));
    };

    const getIconForCategory = (category: string) => {
        if (!isClient) return MoreHorizontal;
        const iconName = categoryIcons[category.toLowerCase()] || 'MoreHorizontal';
        const IconComponent = (LucideIcons as any)[iconName] as FC || MoreHorizontal;
        return IconComponent;
    }
    
    const currentMonthTransactions = useMemo(() => {
        if (!isClient) return [];
        const now = new Date();
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return isSameMonth(now, tDate) && isSameYear(now, tDate);
        });
    }, [transactions, isClient]);


    return (
        <TransactionsContext.Provider value={{ transactions, addTransaction, deleteTransaction, updateTransaction, getIconForCategory, updateCategoryIcon, currentMonthTransactions }}>
            {children}
        </TransactionsContext.Provider>
    );
};

export const useTransactions = () => {
    const context = useContext(TransactionsContext);
    if (context === undefined) {
        throw new Error('useTransactions must be used within a TransactionsProvider');
    }
    return context;
};

    