
"use client";

import Link from "next/link";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

import { FinTrackLayout } from "@/components/fintrack/fintrack-layout";
import { EditTransactionSheet } from "@/components/fintrack/edit-transaction-sheet";
import { useTransactions, Transaction } from "@/contexts/transactions-context";
import { toast } from "@/hooks/use-toast";

/* -------------------- CONSTANTS -------------------- */

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

/* -------------------- PAGE -------------------- */

export default function TransactionsPage() {
  const { transactions, getIconForCategory, deleteTransaction } =
    useTransactions();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const spendingTypeParam = searchParams.get("spendingType");

  const initialDate = fromParam ? new Date(fromParam) : new Date();

  const [selectedMonth, setSelectedMonth] = React.useState(
    months[initialDate.getMonth()]
  );
  const [selectedYear, setSelectedYear] = React.useState(
    initialDate.getFullYear()
  );

  const [transactionToDelete, setTransactionToDelete] =
    React.useState<Transaction | null>(null);
  const [transactionToEdit, setTransactionToEdit] =
    React.useState<Transaction | null>(null);
  
  const hasFilters = fromParam && toParam;

  /* -------------------- FILTER -------------------- */

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((transaction) => {
      const d = new Date(transaction.date);
      let matches = true;

      if (hasFilters && fromParam && toParam) {
        const fromDate = new Date(fromParam);
        const toDate = new Date(toParam);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        matches = d >= fromDate && d <= toDate;
      } else {
        matches =
          months[d.getMonth()] === selectedMonth &&
          d.getFullYear() === selectedYear;
      }

      if (matches && spendingTypeParam) {
        matches = transaction.spendingType === spendingTypeParam;
      }
      
      return matches;
    });
  }, [transactions, selectedMonth, selectedYear, hasFilters, fromParam, toParam, spendingTypeParam]);

  /* -------------------- DELETE -------------------- */

  const handleDelete = React.useCallback(() => {
    if (!transactionToDelete) return;

    requestAnimationFrame(() => {
      deleteTransaction(transactionToDelete.id);

      toast({
        title: "Transaction Deleted",
        description: `${transactionToDelete.name} has been deleted.`,
      });

      setTransactionToDelete(null);
    });
  }, [transactionToDelete, deleteTransaction]);

  /* -------------------- UI -------------------- */

  return (
    <FinTrackLayout>
      {/* HEADER */}
      <header className="flex items-center pt-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={hasFilters ? "/report" : "/dashboard"}>
            <ArrowLeft />
            <span className="sr-only">Back</span>
          </Link>
        </Button>

        <h1 className="text-lg font-bold mx-auto">All Transactions</h1>
        <div className="w-10" />
      </header>
      
      {hasFilters ? (
        <div className="text-center text-sm text-muted-foreground bg-accent p-2 rounded-md">
          {isClient && fromParam && toParam && (
            <>
              {spendingTypeParam && (
                <>Showing <span className="font-semibold capitalize">{spendingTypeParam}</span> transactions from <br/></>
              )}
              <span className="font-semibold">{format(new Date(fromParam), "PPP")}</span> to <span className="font-semibold">{format(new Date(toParam), "PPP")}</span>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}


      {/* LIST */}
      <Card className="shadow-lg border-0">
        <CardContent className="pt-6 space-y-4">
          {filteredTransactions.map((transaction) => {
            const Icon = getIconForCategory(transaction.category);

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center ${transaction.bgColor}`}
                  >
                    <Icon className={`h-6 w-6 ${transaction.fgColor}`} />
                  </div>

                  <div>
                    <p className="font-semibold">{transaction.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category} •{" "}
                      {new Date(transaction.date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {transaction.type === "income" ? "+" : "-"}₹
                    {transaction.amount.toFixed(2)}
                  </p>

                  {/* DROPDOWN (SAFE) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          setTimeout(
                            () => setTransactionToEdit(transaction),
                            0
                          )
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() =>
                          setTimeout(
                            () => setTransactionToDelete(transaction),
                            0
                          )
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
          })}

          {filteredTransactions.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">
              No transactions for this period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* EDIT SHEET */}
      {transactionToEdit && (
        <EditTransactionSheet
          transaction={transactionToEdit}
          isOpen
          onClose={() => setTransactionToEdit(null)}
        />
      )}

      {/* DELETE CONFIRM */}
      <AlertDialog
        open={!!transactionToDelete}
        onOpenChange={(open) => !open && setTransactionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FinTrackLayout>
  );
}
