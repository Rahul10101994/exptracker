
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, FC } from 'react';
import * as LucideIcons from 'lucide-react';
import { isSameMonth, isSameYear } from 'date-fns';
import { cuid } from '@/lib/utils';

const { Music, ArrowUpCircle, Tv, ShoppingBag, Utensils, Bus, MoreHorizontal } = LucideIcons;

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
    {
        id: '1',
        type: 'expense',
        name: 'Spotify',
        category: 'subscription',
        date: "2024-07-28T12:00:00.000Z",
        amount: 12.99,
        account: 'card',
        spendingType: 'want',
        fgColor: 'text-transaction-spotify-fg',
        bgColor: 'bg-transaction-spotify-bg'
    },
    {
        id: '2',
        type: 'income',
        name: 'Income',
        category: 'freelance',
        date: "2024-07-28T12:00:00.000Z",
        amount: 2500.00,
        account: 'bank',
        fgColor: 'text-transaction-income-fg',
        bgColor: 'bg-transaction-income-bg'
    },
    {
        id: '3',
        type: 'expense',
        name: 'Netflix',
        category: 'subscription',
        date: "2024-07-28T12:00:00.000Z",
        amount: 15.99,
        account: 'card',
        spendingType: 'want',
        fgColor: 'text-transaction-netflix-fg',
        bgColor: 'bg-transaction-netflix-bg'
    },
    {
        id: '4',
        type: 'expense',
        name: 'Zara',
        category: 'shopping',
        date: "2024-07-27T12:00:00.000Z",
        amount: 128.50,
        account: 'card',
        spendingType: 'want',
        fgColor: 'text-blue-500',
        bgColor: 'bg-blue-100'
    },
    {
        id: '5',
        type: 'expense',
        name: 'The Noodle House',
        category: 'food',
        date: "2024-07-26T12:00:00.000Z",
        amount: 34.20,
        account: 'cash',
        spendingType: 'need',
        fgColor: 'text-orange-500',
        bgColor: 'bg-orange-100'
    },
    {
        id: '6',
        type: 'expense',
        name: 'Metro Ticket',
        category: 'transport',
        date: "2024-07-25T12:00:00.000Z",
        amount: 2.75,
        account: 'card',
        spendingType: 'need',
        fgColor: 'text-green-500',
        bgColor: 'bg-green-100'
    },
    {
        id: '7',
        type: 'expense',
        name: 'Apple Store',
        category: 'shopping',
        date: "2024-06-28T12:00:00.000Z",
        amount: 999.00,
        account: 'card',
        spendingType: 'want',
        fgColor: 'text-red-500',
        bgColor: 'bg-red-100'
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
    other: 'MoreHorizontal'
};


export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [categoryIcons, setCategoryIcons] = useState<{ [key: string]: string }>(initialCategoryIcons);

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
        const iconName = categoryIcons[category.toLowerCase()] || 'MoreHorizontal';
        const IconComponent = (LucideIcons as any)[iconName] as FC || MoreHorizontal;
        return IconComponent;
    }
    
    const currentMonthTransactions = useMemo(() => {
        const now = new Date();
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return isSameMonth(now, tDate) && isSameYear(now, tDate);
        });
    }, [transactions]);


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
