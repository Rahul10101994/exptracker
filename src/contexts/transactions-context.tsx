"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Music, ArrowUpCircle, Tv, ShoppingBag, Utensils, Bus, MoreHorizontal } from 'lucide-react';

type Transaction = {
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

type NewTransaction = Omit<Transaction, 'id' | 'fgColor' | 'bgColor'>;

interface TransactionsContextType {
    transactions: Transaction[];
    addTransaction: (transaction: NewTransaction) => void;
    getIconForCategory: (category: string) => React.ElementType;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

const initialTransactions: Transaction[] = [
    {
        id: '1',
        type: 'expense',
        name: 'Spotify',
        category: 'subscription',
        date: '2024-05-28',
        amount: 12.99,
        account: 'card',
        fgColor: 'text-transaction-spotify-fg',
        bgColor: 'bg-transaction-spotify-bg'
    },
    {
        id: '2',
        type: 'income',
        name: 'Income',
        category: 'freelance',
        date: '2024-05-25',
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
        date: '2024-05-22',
        amount: 15.99,
        account: 'card',
        fgColor: 'text-transaction-netflix-fg',
        bgColor: 'bg-transaction-netflix-bg'
    },
    {
        id: '4',
        type: 'expense',
        name: 'Zara',
        category: 'shopping',
        date: '2024-05-21',
        amount: 128.50,
        account: 'card',
        fgColor: 'text-blue-500',
        bgColor: 'bg-blue-100'
    },
    {
        id: '5',
        type: 'expense',
        name: 'The Noodle House',
        category: 'food',
        date: '2024-05-20',
        amount: 34.20,
        account: 'cash',
        fgColor: 'text-orange-500',
        bgColor: 'bg-orange-100'
    },
    {
        id: '6',
        type: 'expense',
        name: 'Metro Ticket',
        category: 'transport',
        date: '2024-05-18',
        amount: 2.75,
        account: 'card',
        fgColor: 'text-green-500',
        bgColor: 'bg-green-100'
    },
    {
        id: '7',
        type: 'expense',
        name: 'Apple Store',
        category: 'shopping',
        date: '2024-04-28',
        amount: 999.00,
        account: 'card',
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
    other: { fgColor: 'text-gray-500', bgColor: 'bg-gray-100' },
};

const categoryIcons: { [key: string]: React.ElementType } = {
    subscription: Music,
    freelance: ArrowUpCircle,
    income: ArrowUpCircle,
    salary: ArrowUpCircle,
    bonus: ArrowUpCircle,
    shopping: ShoppingBag,
    food: Utensils,
    transport: Bus,
    bills: Tv,
    other: MoreHorizontal
};


export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

    const addTransaction = (transaction: NewTransaction) => {
        const styles = categoryStyles[transaction.category.toLowerCase()] || categoryStyles.other;
        const newTransaction: Transaction = {
            id: new Date().toISOString(),
            ...transaction,
            date: transaction.date.toISOString(),
            ...styles
        };
        setTransactions(prev => [newTransaction, ...prev]);
    };

    const getIconForCategory = (category: string) => {
        return categoryIcons[category.toLowerCase()] || categoryIcons.other;
    }

    return (
        <TransactionsContext.Provider value={{ transactions, addTransaction, getIconForCategory }}>
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
