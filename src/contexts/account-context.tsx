
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useTransactions } from './transactions-context';
import { cuid } from '@/lib/utils';

export type Account = {
    id: string;
    name: string;
    initialBalance: number;
};

export type NewAccount = Omit<Account, 'id'>;

interface AccountContextType {
    accounts: Account[];
    addAccount: (account: NewAccount) => void;
    updateAccount: (id: string, updatedAccount: NewAccount) => void;
    deleteAccount: (id: string) => void;
    correctBalance: (accountId: string, correctBalance: number) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const initialAccounts: Account[] = [
    { id: '1', name: 'Bank', initialBalance: 1000 },
    { id: '2', name: 'Cash', initialBalance: 100 },
    { id: '3', name: 'Card', initialBalance: 0 },
];

export const AccountProvider = ({ children }: { children: ReactNode }) => {
    const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
    const { transactions } = useTransactions();

    const addAccount = (account: NewAccount) => {
        const newAccount: Account = {
            id: cuid(),
            ...account
        };
        setAccounts(prev => [...prev, newAccount]);
    };

    const updateAccount = (id: string, updatedAccount: NewAccount) => {
        setAccounts(prev => prev.map(acc => acc.id === id ? { id, ...updatedAccount } : acc));
    };

    const deleteAccount = (id: string) => {
        setAccounts(prev => prev.filter(acc => acc.id !== id));
    };

    const correctBalance = (accountId: string, correctBalance: number) => {
        const account = accounts.find(a => a.id === accountId);
        if (!account) return;

        const accountTransactions = transactions.filter(t => t.account.toLowerCase() === account.name.toLowerCase());
        const transactionSum = accountTransactions.reduce((acc, t) => {
            if (t.type === 'income') {
                return acc + t.amount;
            } else {
                return acc - t.amount;
            }
        }, 0);

        const currentCalculatedBalance = account.initialBalance + transactionSum;
        const adjustment = correctBalance - currentCalculatedBalance;
        
        const updatedAccount: NewAccount = {
            ...account,
            initialBalance: account.initialBalance + adjustment,
        }
        updateAccount(accountId, updatedAccount);
    };

    return (
        <AccountContext.Provider value={{ accounts, addAccount, updateAccount, deleteAccount, correctBalance }}>
            {children}
        </AccountContext.Provider>
    );
};

export const useAccounts = () => {
    const context = useContext(AccountContext);
    if (context === undefined) {
        throw new Error('useAccounts must be used within an AccountProvider');
    }
    return context;
};
