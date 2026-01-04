
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Music, ArrowUpCircle, Tv, ShoppingBag, Utensils, Bus, MoreHorizontal } from 'lucide-react';
import { isSameMonth, isSameYear } from 'date-fns';


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
    currentMonthTransactions: Transaction[];
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

const initialTransactions: Transaction[] = [
    {
        id: '1',
        type: 'expense',
        name: 'Spotify',
        category: 'subscription',
        date: new Date().toISOString(),
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
        date: new Date().toISOString(),
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
        date: new Date().toISOString(),
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
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
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
        date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
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
        date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
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
        date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
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
    bills: { fgColor: 'text-purple-500', bgColor: 'bg-purple-100' },
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
        setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const getIconForCategory = (category: string) => {
        return categoryIcons[category.toLowerCase()] || categoryIcons.other;
    }
    
    const currentMonthTransactions = useMemo(() => {
        const now = new Date();
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return isSameMonth(now, tDate) && isSameYear(now, tDate);
        });
    }, [transactions]);


    return (
        <TransactionsContext.Provider value={{ transactions, addTransaction, getIconForCategory, currentMonthTransactions }}>
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
