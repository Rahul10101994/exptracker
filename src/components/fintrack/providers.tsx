
"use client";

import { ThemeProvider } from 'next-themes';
import { TransactionsProvider } from '@/contexts/transactions-context';
import { AccountProvider } from '@/contexts/account-context';
import { BudgetProvider } from '@/contexts/budget-context';
import { GoalProvider } from '@/contexts/goal-context';

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <TransactionsProvider>
        <AccountProvider>
          <BudgetProvider>
            <GoalProvider>
              {children}
            </GoalProvider>
          </BudgetProvider>
        </AccountProvider>
      </TransactionsProvider>
    </ThemeProvider>
  );
}
