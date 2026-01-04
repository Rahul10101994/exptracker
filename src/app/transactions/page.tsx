"use client";

import Link from 'next/link';
import * as React from 'react';
import { ArrowLeft, Music, ArrowUpCircle, MoreHorizontal, Tv, ShoppingBag, Utensils, Bus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const allTransactions = [
    {
        icon: <Music className="h-6 w-6 text-transaction-spotify-fg" />,
        name: 'Spotify',
        category: 'Subscription',
        date: '28 May',
        amount: '-$12.99',
        bgColor: 'bg-transaction-spotify-bg'
    },
    {
        icon: <ArrowUpCircle className="h-6 w-6 text-transaction-income-fg" />,
        name: 'Income',
        category: 'Freelance',
        date: '25 May',
        amount: '+$2,500.00',
        bgColor: 'bg-transaction-income-bg'
    },
    {
        icon: <Tv className="h-6 w-6 text-transaction-netflix-fg" />,
        name: 'Netflix',
        category: 'Subscription',
        date: '22 May',
        amount: '-$15.99',
        bgColor: 'bg-transaction-netflix-bg'
    },
    {
        icon: <ShoppingBag className="h-6 w-6 text-blue-500" />,
        name: 'Zara',
        category: 'Shopping',
        date: '21 May',
        amount: '-$128.50',
        bgColor: 'bg-blue-100'
    },
    {
        icon: <Utensils className="h-6 w-6 text-orange-500" />,
        name: 'The Noodle House',
        category: 'Food',
        date: '20 May',
        amount: '-$34.20',
        bgColor: 'bg-orange-100'
    },
    {
        icon: <Bus className="h-6 w-6 text-green-500" />,
        name: 'Metro Ticket',
        category: 'Transport',
        date: '18 May',
        amount: '-$2.75',
        bgColor: 'bg-green-100'
    },
    {
        icon: <ShoppingBag className="h-6 w-6 text-red-500" />,
        name: 'Apple Store',
        category: 'Shopping',
        date: '28 Apr',
        amount: '-$999.00',
        bgColor: 'bg-red-100'
    }
];

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);


export default function TransactionsPage() {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);

  const filteredTransactions = allTransactions.filter(transaction => {
    // Assuming the current year for transactions as it's not specified in the data
    const transactionDate = new Date(`${transaction.date} ${selectedYear}`);
    const transactionMonth = transactionDate.getMonth();
    const transactionYear = transactionDate.getFullYear();

    return months[transactionMonth] === selectedMonth && transactionYear === selectedYear;
  });


  return (
    <div className="bg-background">
      <main className="relative mx-auto flex min-h-screen max-w-sm flex-col gap-6 p-4 pb-28">
        <header className="flex items-center pt-2">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                    <ArrowLeft />
                    <span className="sr-only">Back</span>
                </Link>
            </Button>
            <h1 className="text-lg font-bold text-foreground mx-auto">All Transactions</h1>
            <div className="w-10"></div>
        </header>

        <div className="grid grid-cols-2 gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                    {months.map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                    <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {filteredTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center h-12 w-12 rounded-full ${transaction.bgColor}`}>
                      {transaction.icon}
                    </div>
                    <div>
                      <p className="font-semibold">{transaction.name}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category} &bull; {transaction.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{transaction.amount}</p>
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
               {filteredTransactions.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  No transactions for this period.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
