"use client";

import Link from "next/link";
import * as React from "react";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  useTransactions,
  Transaction,
} from "@/contexts/transactions-context";
import { EditTransactionSheet } from "./edit-transaction-sheet";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function TransactionHistory() {
  const {
    currentMonthTransactions,
    getIconForCategory,
    deleteTransaction,
  } = useTransactions();

  const [transactionToDelete, setTransactionToDelete] =
    React.useState<Transaction | null>(null);
  const [transactionToEdit, setTransactionToEdit] =
    React.useState<Transaction | null>(null);

  const recentTransactions =
    currentMonthTransactions.slice(0, 3);

  const handleDelete = () => {
    if (!transactionToDelete) return;

    deleteTransaction(transactionToDelete.id);
    toast({
      title: "Transaction Deleted",
      description: `${transactionToDelete.name} has been deleted.`,
    });
    setTransactionToDelete(null);
  };

  const handleEditClick = (
    e: React.MouseEvent,
    transaction: Transaction
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setTransactionToEdit(transaction);
  };

  return (
    <Card className="border-0 shadow-lg w-full">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-sm sm:text-base font-medium">
          Recent Transactions
        </CardTitle>

        <Button variant="ghost" size="sm" asChild>
          <Link href="/transactions">See all</Link>
        </Button>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => {
              const Icon = getIconForCategory(
                transaction.category
              );

              const isIncome =
                transaction.type === "income";

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  {/* Left */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                        transaction.bgColor
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          transaction.fgColor
                        )}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {transaction.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {transaction.category} •{" "}
                        {new Date(
                          transaction.date
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-1">
                    <p
                      className={cn(
                        "text-sm font-semibold whitespace-nowrap",
                        isIncome
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {isIncome ? "+" : "-"}₹
                      {transaction.amount.toFixed(0)}
                    </p>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={(e) =>
                            handleEditClick(e, transaction)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() =>
                            setTransactionToDelete(transaction)
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-sm text-muted-foreground py-10">
              No transactions for this month
            </div>
          )}
        </div>

        {/* Edit Sheet */}
        {transactionToEdit && (
          <EditTransactionSheet
            transaction={transactionToEdit}
            isOpen={!!transactionToEdit}
            onClose={() => setTransactionToEdit(null)}
          />
        )}

        {/* Delete Dialog */}
        <AlertDialog
          open={!!transactionToDelete}
          onOpenChange={(open) =>
            !open && setTransactionToDelete(null)
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete transaction?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
