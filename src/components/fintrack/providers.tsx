
"use client";

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
    <TransactionsProvider>
      <AccountProvider>
        <BudgetProvider>
          <GoalProvider>
            {children}
          </GoalProvider>
        </BudgetProvider>
      </AccountProvider>
    </TransactionsProvider>
  );
}
