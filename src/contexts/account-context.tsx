
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const initialAccounts: Account[] = [
    { id: '1', name: 'Bank', initialBalance: 1000 },
    { id: '2', name: 'Cash', initialBalance: 100 },
    { id: '3', name: 'Card', initialBalance: 0 },
];

export const AccountProvider = ({ children }: { children: ReactNode }) => {
    const [accounts, setAccounts] = useState<Account[]>(initialAccounts);

    const addAccount = (account: NewAccount) => {
        const newAccount: Account = {
            id: new Date().toISOString(),
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

    return (
        <AccountContext.Provider value={{ accounts, addAccount, updateAccount, deleteAccount }}>
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
