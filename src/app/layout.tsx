import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { PageTransition } from '@/components/fintrack/page-transition';
import { TransactionsProvider } from '@/contexts/transactions-context';
import { BudgetProvider } from '@/contexts/budget-context';
import { GoalProvider } from '@/contexts/goal-context';

export const metadata: Metadata = {
  title: 'FinTrack',
  description: 'Your personal finance tracking companion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <TransactionsProvider>
          <BudgetProvider>
            <GoalProvider>
              <PageTransition>{children}</PageTransition>
              <Toaster />
            </GoalProvider>
          </BudgetProvider>
        </TransactionsProvider>
      </body>
    </html>
  );
}
