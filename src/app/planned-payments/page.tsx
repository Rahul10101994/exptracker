
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinTrackLayout } from "@/components/fintrack/fintrack-layout";
import { Card, CardContent } from "@/components/ui/card";
import { useTransactions } from "@/contexts/transactions-context";
import { format } from "date-fns";

export default function PlannedPaymentsPage() {
  const { transactions } = useTransactions();

  const recurringTransactions = React.useMemo(() => {
    return transactions.filter(t => t.recurring);
  }, [transactions]);

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
        <Button variant="ghost" size="icon">
            <CalendarPlus />
            <span className="sr-only">Add Planned Payment</span>
        </Button>
      </header>

      <Card>
        <CardContent className="pt-6">
          {recurringTransactions.length > 0 ? (
            <div className="space-y-4">
              {recurringTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-sm text-muted-foreground">
                           Last payment: {format(new Date(t.date), "PPP")}
                        </p>
                    </div>
                    <p className="font-semibold text-red-500">-₹{t.amount.toFixed(2)}</p>
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
