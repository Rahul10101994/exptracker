
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, writeBatch, getDocs, updateDoc } from 'firebase/firestore';
import { addMonths, addYears, addWeeks } from 'date-fns';

export type PlannedPayment = {
    id: string;
    type: 'income' | 'expense' | 'investment';
    name: string;
    amount: number;
    date: string; // ISO string
    category: string;
    account?: string;
    spendingType?: 'need' | 'want';
    period?: 'one-time' | 'weekly' | 'monthly' | 'half-yearly' | 'yearly';
};

export type NewPlannedPayment = Omit<PlannedPayment, 'id'>;

interface PlannedPaymentContextType {
    plannedPayments: PlannedPayment[];
    addPlannedPayment: (payment: Omit<NewPlannedPayment, 'date'> & { date: Date }) => Promise<void>;
    deletePlannedPayment: (id: string) => Promise<void>;
    deleteAllPlannedPayments: () => Promise<void>;
    markPaymentAsPaid: (payment: PlannedPayment) => Promise<void>;
}

const PlannedPaymentContext = createContext<PlannedPaymentContextType | undefined>(undefined);

export const PlannedPaymentProvider = ({ children }: { children: ReactNode }) => {
    const [plannedPayments, setPlannedPayments] = useState<PlannedPayment[]>([]);
    const userContext = useUser();
    const firestore = useFirestore();

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
        if (dataToSave.period === undefined) delete dataToSave.period;
        
        await addDoc(paymentsCollection, dataToSave);
    };

    const deletePlannedPayment = async (id: string) => {
        if (!firestore || !userContext?.user) return;
        const paymentDoc = doc(firestore, 'users', userContext.user.uid, 'plannedPayments', id);
        await deleteDoc(paymentDoc);
    };

    const deleteAllPlannedPayments = async () => {
        if (!firestore || !userContext?.user) return;
        const paymentsCollection = collection(firestore, 'users', userContext.user.uid, 'plannedPayments');
        const snapshot = await getDocs(paymentsCollection);
        if (snapshot.empty) return;

        const batch = writeBatch(firestore);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }

    const markPaymentAsPaid = async (payment: PlannedPayment) => {
        if (!firestore || !userContext?.user) return;

        const newTransaction: any = {
            name: payment.name,
            amount: payment.amount,
            date: new Date().toISOString(), 
            category: payment.category,
            type: payment.type,
            account: payment.account,
            spendingType: payment.spendingType,
            recurring: false, 
        };

        // Firestore does not allow 'undefined' fields.
        if (newTransaction.spendingType === undefined) delete newTransaction.spendingType;
        if (newTransaction.account === undefined) delete newTransaction.account;

        const batch = writeBatch(firestore);

        const newTransactionRef = doc(collection(firestore, 'users', userContext.user.uid, 'transactions'));
        batch.set(newTransactionRef, newTransaction);
        
        const plannedPaymentRef = doc(firestore, 'users', userContext.user.uid, 'plannedPayments', payment.id);
        
        if (payment.period === 'weekly') {
            const nextDate = addWeeks(new Date(payment.date), 1);
            batch.update(plannedPaymentRef, { date: nextDate.toISOString() });
        } else if (payment.period === 'monthly') {
            const nextDate = addMonths(new Date(payment.date), 1);
            batch.update(plannedPaymentRef, { date: nextDate.toISOString() });
        } else if (payment.period === 'half-yearly') {
            const nextDate = addMonths(new Date(payment.date), 6);
            batch.update(plannedPaymentRef, { date: nextDate.toISOString() });
        } else if (payment.period === 'yearly') {
            const nextDate = addYears(new Date(payment.date), 1);
            batch.update(plannedPaymentRef, { date: nextDate.toISOString() });
        } else { // 'one-time'
            batch.delete(plannedPaymentRef);
        }

        await batch.commit();
    };


    return (
        <PlannedPaymentContext.Provider value={{ plannedPayments, addPlannedPayment, deletePlannedPayment, deleteAllPlannedPayments, markPaymentAsPaid }}>
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
