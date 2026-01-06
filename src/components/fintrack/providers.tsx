
"use client";

import { ThemeProvider } from 'next-themes';
import { TransactionsProvider } from '@/contexts/transactions-context';
import { AccountProvider } from '@/contexts/account-context';
import { BudgetProvider } from '@/contexts/budget-context';
import { GoalProvider } from '@/contexts/goal-context';
import { FirebaseClientProvider } from '@/firebase';
import { useMemo } from 'react';
import { initializeFirebase } from '@/firebase';

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebaseApp = useMemo(() => initializeFirebase(), []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <FirebaseClientProvider app={firebaseApp}>
        <TransactionsProvider>
          <AccountProvider>
            <BudgetProvider>
              <GoalProvider>
                {children}
              </GoalProvider>
            </BudgetProvider>
          </AccountProvider>
        </TransactionsProvider>
      </FirebaseClientProvider>
    </ThemeProvider>
  );
}
