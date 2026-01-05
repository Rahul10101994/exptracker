
"use client";

import Link from 'next/link';
import * as React from 'react';
import { ArrowLeft, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions, Transaction } from '@/contexts/transactions-context';
import { FinTrackLayout } from '@/components/fintrack/fintrack-layout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EditTransactionSheet } from '@/components/fintrack/edit-transaction-sheet';
import { toast } from '@/hooks/use-toast';

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);


export default function TransactionsPage() {
  const { transactions, getIconForCategory, deleteTransaction } = useTransactions();
  const [selectedMonth, setSelectedMonth] = React.useState<string>(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);
  const [transactionToDelete, setTransactionToDelete] = React.useState<Transaction | null>(null);
  const [transactionToEdit, setTransactionToEdit] = React.useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const transactionMonth = transactionDate.getMonth();
    const transactionYear = transactionDate.getFullYear();

    return months[transactionMonth] === selectedMonth && transactionYear === selectedYear;
  });

  const handleDelete = () => {
    if (transactionToDelete) {
        deleteTransaction(transactionToDelete.id);
        toast({
            title: "Transaction Deleted",
            description: `${transactionToDelete.name} has been deleted.`,
        });
        setTransactionToDelete(null);
    }
  };
  
  const handleEditClick = (e: React.MouseEvent, transaction: Transaction) => {
    e.preventDefault();
    e.stopPropagation();
    setTransactionToEdit(transaction);
  }

  const handleCloseEditSheet = () => {
    setTransactionToEdit(null);
  }

  return (
    <FinTrackLayout>
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
              {filteredTransactions.map((transaction) => {
                  const Icon = getIconForCategory(transaction.category);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between">
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
                              <DropdownMenuItem onSelect={(e) => handleEditClick(e, transaction)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onSelect={() => setTransactionToDelete(transaction)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
               {filteredTransactions.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  No transactions for this period.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {transactionToEdit && (
            <EditTransactionSheet
              transaction={transactionToEdit}
              isOpen={!!transactionToEdit}
              onClose={handleCloseEditSheet}
            />
        )}
        <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this transaction.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </FinTrackLayout>
  );
}
