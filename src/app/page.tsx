import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinTrackHeader } from '@/components/fintrack/header';
import { BalanceCard } from '@/components/fintrack/balance-card';
import { InvestmentCard } from '@/components/fintrack/investment-card';
import { SavingRateCard } from '@/components/fintrack/saving-rate-card';
import { SpendingTrendChart } from '@/components/fintrack/spending-trend-chart';
import { TransactionHistory } from '@/components/fintrack/transaction-history';
import { BudgetCard } from '@/components/fintrack/budget-card';
import { CategoryBreakdownChart } from '@/components/fintrack/category-breakdown-chart';
import { AddTransactionSheet } from '@/components/fintrack/add-transaction-sheet';

export default function Home() {
  return (
    <div className="bg-background">
      <main className="relative mx-auto flex min-h-screen max-w-sm flex-col gap-6 p-4 pb-28">
        <FinTrackHeader />
        <BalanceCard />
        <div className="grid grid-cols-2 gap-4">
          <SavingRateCard />
          <InvestmentCard />
        </div>
        <BudgetCard />
        <SpendingTrendChart />
        <CategoryBreakdownChart />
        <TransactionHistory />
      </main>
      <div className="fixed bottom-6 left-1/2 z-10 -translate-x-1/2">
        <AddTransactionSheet>
          <Button size="icon" className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
            <Plus className="h-8 w-8" />
            <span className="sr-only">Add Transaction</span>
          </Button>
        </AddTransactionSheet>
      </div>
    </div>
  );
}
