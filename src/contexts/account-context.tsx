
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
    updateAccount: (id: string, updatedAccount: NewAccount) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    correctBalance: (accountId: string, correctBalance: number) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const { transactions } = useTransactions();
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

    const updateAccount = async (id: string, updatedAccount: NewAccount) => {
        if (!firestore || !userContext?.user) return;
        const accountDoc = doc(firestore, 'users', userContext.user.uid, 'accounts', id);
        await updateDoc(accountDoc, updatedAccount);
    };

    const deleteAccount = async (id: string) => {
        if (!firestore || !userContext?.user) return;
        const accountDoc = doc(firestore, 'users', userContext.user.uid, 'accounts', id);
        await deleteDoc(accountDoc);
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
