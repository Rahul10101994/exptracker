
"use client";

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinTrackLayout } from '@/components/fintrack/fintrack-layout';
import { Card, CardContent } from '@/components/ui/card';
import { useAccounts, Account } from '@/contexts/account-context';
import { AddAccountSheet } from '@/components/fintrack/add-account-sheet';
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
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';
import { EditAccountSheet } from '@/components/fintrack/edit-account-sheet';
import { useTransactions } from '@/contexts/transactions-context';

export default function AccountsPage() {
    const { accounts, deleteAccount } = useAccounts();
    const { transactions } = useTransactions();
    const [accountToDelete, setAccountToDelete] = React.useState<Account | null>(null);
    const [accountToEdit, setAccountToEdit] = React.useState<Account | null>(null);

    const accountBalances = React.useMemo(() => {
        const balances: { [accountId: string]: number } = {};
        accounts.forEach(account => {
            const accountTransactions = transactions.filter(t => t.account.toLowerCase() === account.name.toLowerCase());
            const balance = accountTransactions.reduce((acc, t) => {
                if (t.type === 'income') {
                    return acc + t.amount;
                } else {
                    return acc - t.amount;
                }
            }, 0);
            balances[account.id] = balance;
        });
        return balances;
    }, [accounts, transactions]);

    const handleDelete = () => {
        if (accountToDelete) {
            deleteAccount(accountToDelete.id);
            toast({
                title: "Account Deleted",
                description: `The account "${accountToDelete.name}" has been deleted.`,
            });
            setAccountToDelete(null);
        }
    };
    
    const handleEditClick = (e: Event, account: Account) => {
        e.preventDefault();
        setAccountToEdit(account);
    }

    return (
        <FinTrackLayout>
            <header className="flex items-center pt-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings">
                        <ArrowLeft />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="text-lg font-bold text-foreground mx-auto">Manage Accounts</h1>
                <AddAccountSheet>
                    <Button variant="ghost" size="icon">
                        <PlusCircle />
                        <span className="sr-only">Add Account</span>
                    </Button>
                </AddAccountSheet>
            </header>

            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {accounts.map((account) => (
                            <div key={account.id} className="flex items-center justify-between">
                                <p className="font-semibold capitalize">{account.name}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-muted-foreground">${accountBalances[account.id]?.toFixed(2) ?? '0.00'}</p>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                          <DropdownMenuItem onSelect={(e) => handleEditClick(e, account)}>
                                              <Edit className="mr-2 h-4 w-4" />
                                              <span>Edit</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="text-destructive" onSelect={() => setAccountToDelete(account)}>
                                              <Trash2 className="mr-2 h-4 w-4" />
                                              <span>Delete</span>
                                          </DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            
            {accountToEdit && (
                <EditAccountSheet account={accountToEdit} >
                    {/* The sheet is controlled by accountToEdit state, no trigger needed here */}
                </EditAccountSheet>
            )}


            <AlertDialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the account {"\""}<span className='capitalize font-semibold'>{accountToDelete?.name}</span>{"\""}. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setAccountToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </FinTrackLayout>
    );
}

