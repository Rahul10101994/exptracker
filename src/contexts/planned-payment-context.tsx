
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

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
        
        await addDoc(paymentsCollection, dataToSave);
    };

    const deletePlannedPayment = async (id: string) => {
        if (!firestore || !userContext?.user) return;
        const paymentDoc = doc(firestore, 'users', userContext.user.uid, 'plannedPayments', id);
        await deleteDoc(paymentDoc);
    };

    return (
        <PlannedPaymentContext.Provider value={{ plannedPayments, addPlannedPayment, deletePlannedPayment }}>
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
