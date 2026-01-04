import { Music, ArrowUpCircle, MoreHorizontal, Tv } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const transactions = [
  {
    icon: <Music className="h-6 w-6 text-transaction-spotify-fg" />,
    name: 'Spotify',
    category: 'Subscription',
    amount: '-$12.99',
    bgColor: 'bg-transaction-spotify-bg'
  },
  {
    icon: <ArrowUpCircle className="h-6 w-6 text-transaction-income-fg" />,
    name: 'Income',
    category: 'Freelance',
    amount: '+$2,500.00',
    bgColor: 'bg-transaction-income-bg'
  },
  {
    icon: <Tv className="h-6 w-6 text-transaction-netflix-fg" />,
    name: 'Netflix',
    category: 'Subscription',
    amount: '-$15.99',
    bgColor: 'bg-transaction-netflix-bg'
  },
];

export function TransactionHistory() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm">See all</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center h-12 w-12 rounded-full ${transaction.bgColor}`}>
                  {transaction.icon}
                </div>
                <div>
                  <p className="font-semibold">{transaction.name}</p>
                  <p className="text-sm text-muted-foreground">{transaction.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{transaction.amount}</p>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
