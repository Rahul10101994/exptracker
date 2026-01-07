
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, writeBatch } from 'firebase/firestore';
import { useTransactions } from './transactions-context';

export type PlannedPayment = {
    id: string;
    type: 'income' | 'expense' | 'investment';
    name: string;
    amount: number;
    date: string; // ISO string
    category: string;
    account?: string;
    spendingType?: 'need' | 'want';
};

export type NewPlannedPayment = Omit<PlannedPayment, 'id'>;

interface PlannedPaymentContextType {
    plannedPayments: PlannedPayment[];
    addPlannedPayment: (payment: Omit<NewPlannedPayment, 'date'> & { date: Date }) => Promise<void>;
    deletePlannedPayment: (id: string) => Promise<void>;
    markPaymentAsPaid: (payment: PlannedPayment) => Promise<void>;
}

const PlannedPaymentContext = createContext<PlannedPaymentContextType | undefined>(undefined);

export const PlannedPaymentProvider = ({ children }: { children: ReactNode }) => {
    const [plannedPayments, setPlannedPayments] = useState<PlannedPayment[]>([]);
    const userContext = useUser();
    const firestore = useFirestore();
    const { addTransactionFromPlannedPayment } = useTransactions();

    useEffect(() => {
        if (firestore && userContext?.user) {
            const paymentsCollection = collection(firestore, 'users', userContext.user.uid, 'plannedPayments');
            const q = query(paymentsCollection, orderBy('date', 'asc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newPayments = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                } as PlannedPayment));
                setPlannedPayments(newPayments);
            });
            return () => unsubscribe();
        } else {
            setPlannedPayments([]);
        }
    }, [firestore, userContext]);

    const addPlannedPayment = async (payment: Omit<NewPlannedPayment, 'date'> & { date: Date }) => {
        if (!firestore || !userContext?.user) return;
        const paymentsCollection = collection(firestore, 'users', userContext.user.uid, 'plannedPayments');
        
        const dataToSave: any = {
            ...payment,
            date: payment.date.toISOString(),
        };

        if (dataToSave.spendingType === undefined) delete dataToSave.spendingType;
        if (dataToSave.account === undefined) delete dataToSave.account;
        
        await addDoc(paymentsCollection, dataToSave);
    };

    const deletePlannedPayment = async (id: string) => {
        if (!firestore || !userContext?.user) return;
        const paymentDoc = doc(firestore, 'users', userContext.user.uid, 'plannedPayments', id);
        await deleteDoc(paymentDoc);
    };

    const markPaymentAsPaid = async (payment: PlannedPayment) => {
        if (!firestore || !userContext?.user) return;

        // 1. Create the new transaction object
        const newTransaction = {
            name: payment.name,
            amount: payment.amount,
            date: new Date().toISOString(), // Mark as paid today
            category: payment.category,
            type: payment.type,
            account: payment.account,
            spendingType: payment.spendingType,
            recurring: false, // It's now a one-time transaction record
        };

        // 2. Use a batch write to ensure atomicity
        const batch = writeBatch(firestore);

        const newTransactionRef = doc(collection(firestore, 'users', userContext.user.uid, 'transactions'));
        batch.set(newTransactionRef, newTransaction);
        
        const plannedPaymentRef = doc(firestore, 'users', userContext.user.uid, 'plannedPayments', payment.id);
        batch.delete(plannedPaymentRef);

        await batch.commit();
    };


    return (
        <PlannedPaymentContext.Provider value={{ plannedPayments, addPlannedPayment, deletePlannedPayment, markPaymentAsPaid }}>
            {children}
        </PlannedPaymentContext.Provider>
    );
};

export const usePlannedPayments = () => {
    const context = useContext(PlannedPaymentContext);
    if (context === undefined) {
        throw new Error('usePlannedPayments must be used within a PlannedPaymentProvider');
    }
    return context;
};

