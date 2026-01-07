
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CalendarPlus, CheckCircle, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinTrackLayout } from "@/components/fintrack/fintrack-layout";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { PlannedPayment, usePlannedPayments } from "@/contexts/planned-payment-context";
import { AddPlannedPaymentSheet } from "@/components/fintrack/add-planned-payment-sheet";
import { useTransactions } from "@/contexts/transactions-context";
import { toast } from "@/hooks/use-toast";
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

export default function PlannedPaymentsPage() {
  const { plannedPayments, deletePlannedPayment } = usePlannedPayments();
  const { addTransaction } = useTransactions();
  const [paymentToDelete, setPaymentToDelete] = React.useState<PlannedPayment | null>(null);


  const handleMarkAsPaid = async (payment: PlannedPayment) => {
    // Create a new transaction from the planned payment
    const newTransaction = {
      name: payment.name,
      amount: payment.amount,
      date: new Date(payment.date),
      category: payment.category,
      type: payment.type,
      account: payment.account,
      spendingType: payment.spendingType,
      recurring: false, // It's now a one-time transaction record
    };
    
    // Add to actual transactions
    await addTransaction(newTransaction);

    // Delete from planned payments
    await deletePlannedPayment(payment.id);

    toast({
      title: "Payment Recorded",
      description: `"${payment.name}" has been marked as paid and added to your transactions.`,
    });
  };

  const handleDelete = () => {
    if (!paymentToDelete) return;
    deletePlannedPayment(paymentToDelete.id);
    toast({
      title: "Planned Payment Deleted",
      description: `"${paymentToDelete.name}" has been deleted.`,
    });
    setPaymentToDelete(null);
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
        <h1 className="text-lg font-bold mx-auto">Planned Payments</h1>
        <AddPlannedPaymentSheet>
          <Button variant="ghost" size="icon">
            <CalendarPlus />
            <span className="sr-only">Add Planned Payment</span>
          </Button>
        </AddPlannedPaymentSheet>
      </header>

      <Card>
        <CardContent className="pt-6">
          {plannedPayments.length > 0 ? (
            <div className="space-y-4">
              {plannedPayments.map(t => (
                <div key={t.id} className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-sm text-muted-foreground">
                           Due: {format(new Date(t.date), "PPP")}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className={`font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                          {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                      </p>
                      
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                          >
                            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleMarkAsPaid(t)}
                            className="text-green-600 focus:text-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Paid
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setPaymentToDelete(t)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                    </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              You have no planned payments.
            </div>
          )}
        </CardContent>
      </Card>
       <AlertDialog
        open={!!paymentToDelete}
        onOpenChange={(open) => !open && setPaymentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the planned payment for {" "}
              <span className="font-semibold">{paymentToDelete?.name}</span>.
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
