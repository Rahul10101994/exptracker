
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CalendarPlus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinTrackLayout } from "@/components/fintrack/fintrack-layout";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { usePlannedPayments } from "@/contexts/planned-payment-context";
import { AddPlannedPaymentSheet } from "@/components/fintrack/add-planned-payment-sheet";
import { useTransactions } from "@/contexts/transactions-context";
import { toast } from "@/hooks/use-toast";

export default function PlannedPaymentsPage() {
  const { plannedPayments, deletePlannedPayment } = usePlannedPayments();
  const { addTransaction } = useTransactions();

  const handleMarkAsPaid = async (payment: any) => {
    const transaction = {
      ...payment,
      date: new Date(payment.date), // Ensure date is a Date object
      recurring: true, // Mark it as a recurring transaction in history
    };
    
    // Add to actual transactions
    await addTransaction(transaction);

    // Delete from planned payments
    await deletePlannedPayment(payment.id);

    toast({
      title: "Payment Recorded",
      description: `"${payment.name}" has been marked as paid and added to your transactions.`,
    });
  };

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
                      <Button size="sm" variant="ghost" onClick={() => handleMarkAsPaid(t)} className="h-8">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-xs">Paid</span>
                      </Button>
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
    </FinTrackLayout>
  );
}
