
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useTransactions } from './transactions-context';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query } from 'firebase/firestore';

export type Account = {
    id: string;
    name: string;
    initialBalance: number;
};

export type NewAccount = Omit<Account, 'id'>;

interface AccountContextType {
    accounts: Account[];
    addAccount: (account: NewAccount) => Promise<void>;
    updateAccount: (id: string, updatedAccount: Partial<NewAccount>) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    correctBalance: (accountId: string, correctBalance: number) => void;
    getAccountBalance: (accountId: string) => number;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const { transactions, addTransaction } = useTransactions();
    const userContext = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        if (firestore && userContext?.user) {
            const accountsCollection = collection(firestore, 'users', userContext.user.uid, 'accounts');
            const q = query(accountsCollection);
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newAccounts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                } as Account));
                setAccounts(newAccounts);
            });
            return () => unsubscribe();
        } else {
            setAccounts([]);
        }
    }, [firestore, userContext]);


    const addAccount = async (account: NewAccount) => {
        if (!firestore || !userContext?.user) return;
        const accountsCollection = collection(firestore, 'users', userContext.user.uid, 'accounts');
        await addDoc(accountsCollection, account);
    };

    const updateAccount = async (id: string, updatedAccount: Partial<NewAccount>) => {
        if (!firestore || !userContext?.user) return;
        const accountDoc = doc(firestore, 'users', userContext.user.uid, 'accounts', id);
        await updateDoc(accountDoc, updatedAccount);
    };

    const deleteAccount = async (id: string) => {
        if (!firestore || !userContext?.user) return;
        const accountDoc = doc(firestore, 'users', userContext.user.uid, 'accounts', id);
        await deleteDoc(accountDoc);
    };

    const getAccountBalance = useCallback((accountId: string) => {
        const account = accounts.find(a => a.id === accountId);
        if (!account) return 0;
    
        const accountTransactions = transactions.filter(
            (t) =>
              (t.type !== 'transfer' && t.account?.toLowerCase() === account.name.toLowerCase()) ||
              (t.type === 'transfer' && (t.fromAccount?.toLowerCase() === account.name.toLowerCase() || t.toAccount?.toLowerCase() === account.name.toLowerCase()))
          );
    
        const balance = accountTransactions.reduce((acc, t) => {
            if (t.type === 'income') return acc + t.amount;
            if (t.type === 'expense' || t.type === 'investment') return acc - t.amount;
            if (t.type === 'transfer') {
                if (t.fromAccount?.toLowerCase() === account.name.toLowerCase()) return acc - t.amount;
                if (t.toAccount?.toLowerCase() === account.name.toLowerCase()) return acc + t.amount;
            }
            return acc;
        }, account.initialBalance);
        
        return balance;
    }, [accounts, transactions]);


    const correctBalance = (accountId: string, newBalance: number) => {
        const account = accounts.find(a => a.id === accountId);
        if (!account) return;

        const currentCalculatedBalance = getAccountBalance(accountId);
        const adjustment = newBalance - currentCalculatedBalance;
        
        if (adjustment !== 0) {
            addTransaction({
                type: adjustment > 0 ? 'income' : 'expense',
                name: 'Balance Correction',
                amount: Math.abs(adjustment),
                date: new Date(),
                category: 'correction',
                account: account.name,
            } as any);
        }
    };

    return (
        <AccountContext.Provider value={{ accounts, addAccount, updateAccount, deleteAccount, correctBalance, getAccountBalance }}>
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
