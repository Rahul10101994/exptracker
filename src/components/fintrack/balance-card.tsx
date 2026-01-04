import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function BalanceCard() {
  return (
    <Card className="bg-accent border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between text-accent-foreground/80">
          <p>Total Balance</p>
        </div>
        <p className="text-4xl font-bold text-accent-foreground mt-2">$24,500.00</p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/30 p-2">
                <ArrowDown className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-accent-foreground/80">Income</p>
              <p className="font-semibold text-accent-foreground">$10,500</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/30 p-2">
                <ArrowUp className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-accent-foreground/80">Expense</p>              
              <p className="font-semibold text-accent-foreground">$4,200</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
