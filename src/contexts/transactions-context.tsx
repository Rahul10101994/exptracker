
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, FC, useEffect } from 'react';
import { isSameMonth, isSameYear, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import * as LucideIcons from 'lucide-react';
import { useUser } from '@/firebase';
import { useFirestore } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, writeBatch } from 'firebase/firestore';

const { Music, ArrowUpCircle, Tv, ShoppingBag, Utensils, Bus, MoreHorizontal, Landmark, ArrowRightLeft } = LucideIcons;

export type Transaction = {
    id: string;
    type: 'income' | 'expense' | 'investment' | 'transfer';
    name: string;
    amount: number;
    date: string;
    category: string;
    account?: string;
    fromAccount?: string;
    toAccount?: string;
    spendingType?: 'need' | 'want';
    recurring?: boolean;
    fgColor: string;
    bgColor: string;
};

export type NewTransaction = Omit<Transaction, 'id' | 'fgColor' | 'bgColor'>;

type DeletionFilter = 
    | { type: 'month', year: number, month: number }
    | { type: 'year', year: number }
    | { type: 'period', from: Date, to: Date }
    | { type: 'all' };

interface TransactionsContextType {
    transactions: Transaction[];
    addTransaction: (transaction: Omit<NewTransaction, 'date'> & { date: Date }) => Promise<void>;
    addTransactionFromPlannedPayment: (transaction: any) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    updateTransaction: (id: string, transaction: Omit<NewTransaction, 'date'> & { date: Date }) => Promise<void>;
    getIconForCategory: (category: string) => React.ElementType;
    currentMonthTransactions: Transaction[];
    deleteTransactionsByFilter: (filter: DeletionFilter) => Promise<number>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

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
    transfer: { fgColor: 'text-cyan-500', bgColor: 'bg-cyan-100' },
    other: { fgColor: 'text-gray-500', bgColor: 'bg-gray-100' },
};

const initialCategoryIcons: { [key: string]: React.ElementType } = {
    subscription: Music,
    freelance: ArrowUpCircle,
    income: ArrowUpCircle,
    salary: ArrowUpCircle,
    bonus: ArrowUpCircle,
    shopping: ShoppingBag,
    food: Utensils,
    transport: Bus,
    bills: Tv,
    investment: Landmark,
    transfer: ArrowRightLeft,
    other: MoreHorizontal
};

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isClient, setIsClient] = useState(false);
    const userContext = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (firestore && userContext?.user) {
            const transactionsCollection = collection(firestore, 'users', userContext.user.uid, 'transactions');
            const q = query(transactionsCollection, orderBy('date', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newTransactions = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const styles = categoryStyles[data.category.toLowerCase()] || categoryStyles.other;
                    return {
                        id: doc.id,
                        ...data,
                        ...styles
                    } as Transaction;
                });
                setTransactions(newTransactions);
            });

            return () => unsubscribe();
        } else {
            setTransactions([]);
        }
    }, [firestore, userContext]);


    const addTransaction = async (transaction: Omit<NewTransaction, 'date'> & { date: Date }) => {
        if (!firestore || !userContext?.user) return;
        
        const transactionsCollection = collection(firestore, 'users', userContext.user.uid, 'transactions');
        
        const dataToSave: any = {
            ...transaction,
            date: transaction.date.toISOString(),
        };

        if (dataToSave.spendingType === undefined) delete dataToSave.spendingType;
        if (dataToSave.account === undefined) delete dataToSave.account;
        if (dataToSave.fromAccount === undefined) delete dataToSave.fromAccount;
        if (dataToSave.toAccount === undefined) delete dataToSave.toAccount;
        
        await addDoc(transactionsCollection, dataToSave);
    };

    const addTransactionFromPlannedPayment = async (transaction: any) => {
        if (!firestore || !userContext?.user) return;
        const transactionsCollection = collection(firestore, 'users', userContext.user.uid, 'transactions');
        await addDoc(transactionsCollection, transaction);
    }

    const deleteTransaction = async (id: string) => {
        if (!firestore || !userContext?.user) return;
        const transactionDoc = doc(firestore, 'users', userContext.user.uid, 'transactions', id);
        await deleteDoc(transactionDoc);
    };

    const deleteTransactionsByFilter = async (filter: DeletionFilter): Promise<number> => {
        if (!firestore || !userContext?.user) return 0;
        
        let transactionsToDelete = transactions;

        if (filter.type !== 'all') {
            transactionsToDelete = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                switch(filter.type) {
                    case 'month':
                        const targetDate = new Date(filter.year, filter.month);
                        return isSameMonth(transactionDate, targetDate) && isSameYear(transactionDate, targetDate);
                    case 'year':
                        return isSameYear(transactionDate, new Date(filter.year, 0));
                    case 'period':
                        return isWithinInterval(transactionDate, { start: startOfDay(filter.from), end: endOfDay(filter.to) });
                }
                return false;
            });
        }
        
        const batch = writeBatch(firestore);
        transactionsToDelete.forEach(t => {
            const docRef = doc(firestore, 'users', userContext!.uid, 'transactions', t.id);
            batch.delete(docRef);
        });
        await batch.commit();
        
        return transactionsToDelete.length;
    };

    const updateTransaction = async (id: string, updatedData: Omit<NewTransaction, 'date'> & { date: Date }) => {
        if (!firestore || !userContext?.user) return;
        const transactionDoc = doc(firestore, 'users', userContext.user.uid, 'transactions', id);
        
        const dataToSave: any = {
            ...updatedData,
            date: updatedData.date.toISOString(),
        };

        if (dataToSave.spendingType === undefined) delete dataToSave.spendingType;
        if (dataToSave.account === undefined) delete dataToSave.account;
        if (dataToSave.fromAccount === undefined) delete dataToSave.fromAccount;
        if (dataToSave.toAccount === undefined) delete dataToSave.toAccount;
        if (dataToSave.recurring === undefined) delete dataToSave.recurring;
        
        await updateDoc(transactionDoc, dataToSave);
    };

    const getIconForCategory = (category: string) => {
        if (!isClient) return MoreHorizontal;
        return initialCategoryIcons[category.toLowerCase()] || MoreHorizontal;
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
        <TransactionsContext.Provider value={{ transactions, addTransaction, addTransactionFromPlannedPayment, deleteTransaction, deleteTransactionsByFilter, updateTransaction, getIconForCategory, currentMonthTransactions }}>
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
