
import { FinTrackHeader } from '@/components/fintrack/header';
import { BalanceCard } from '@/components/fintrack/balance-card';
import { InvestmentCard } from '@/components/fintrack/investment-card';
import { SavingRateCard } from '@/components/fintrack/saving-rate-card';
import { SpendingTrendChart } from '@/components/fintrack/spending-trend-chart';
import { TransactionHistory } from '@/components/fintrack/transaction-history';
import { BudgetCard } from '@/components/fintrack/budget-card';
import { CategoryBreakdownChart } from '@/components/fintrack/category-breakdown-chart';
import { FinTrackLayout } from '@/components/fintrack/fintrack-layout';

export default function Home() {
  return (
    <FinTrackLayout>
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
    </FinTrackLayout>
  );
}
