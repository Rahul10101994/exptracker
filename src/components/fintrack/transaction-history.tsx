
"use client";

import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/contexts/transactions-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TransactionHistory() {
  const { currentMonthTransactions, getIconForCategory } = useTransactions();

  // Show only the 3 most recent transactions from the current month
  const recentTransactions = currentMonthTransactions.slice(0, 3);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/transactions">See all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => {
              const Icon = getIconForCategory(transaction.category);
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center h-12 w-12 rounded-full ${transaction.bgColor}`}>
                      <Icon className={`h-6 w-6 ${transaction.fgColor}`} />
                    </div>
                    <div>
                      <p className="font-semibold">{transaction.name}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category} &bull; {new Date(transaction.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center text-muted-foreground py-10">
              No transactions for this month.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
