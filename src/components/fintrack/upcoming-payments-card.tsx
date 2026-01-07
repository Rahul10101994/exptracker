
"use client";

import * as React from "react";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlannedPayments } from "@/contexts/planned-payment-context";
import { Bell, CalendarClock } from "lucide-react";
import { format, isWithinInterval, addDays, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export function UpcomingPaymentsCard() {
  const { plannedPayments } = usePlannedPayments();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const upcomingPayments = React.useMemo(() => {
    if (!isClient) return [];
    const now = new Date();
    const futureLimit = addDays(now, 30); // Show payments within the next 30 days

    return plannedPayments
      .filter((p) => {
        const paymentDate = new Date(p.date);
        return isWithinInterval(paymentDate, { start: now, end: futureLimit });
      })
      .slice(0, 3); // Show max 3 upcoming payments on dashboard
  }, [plannedPayments, isClient]);

  if (upcomingPayments.length === 0) {
    return null; // Don't render the card if there are no upcoming payments
  }

  const DueDate = ({ date }: { date: string }) => {
    const paymentDate = new Date(date);
    const now = new Date();
    const daysUntil = differenceInDays(paymentDate, now);
    let color = "text-muted-foreground";
    let text = format(paymentDate, "MMM d");

    if (daysUntil <= 1) {
      color = "text-red-500 font-semibold";
      text = "Due tomorrow";
    } else if (daysUntil <= 3) {
      color = "text-orange-500 font-semibold";
      text = `Due in ${daysUntil} days`;
    }

    if (daysUntil === 0) {
        text = "Due today";
    }


    return <span className={cn("text-xs", color)}>{text}</span>;
  }

  return (
    <Card className="border-0 shadow-lg w-full">
      <CardHeader className="p-4 pb-2 flex-row items-center justify-between">
        <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-sm sm:text-base font-medium">
            Upcoming Payments
            </CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild>
            <Link href="/planned-payments">
                View All
            </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
            {upcomingPayments.map(payment => (
                <div key={payment.id} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="font-semibold truncate">{payment.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{payment.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                         <p className={`font-semibold ${payment.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                            {payment.type === 'income' ? '+' : '-'}₹{payment.amount.toFixed(0)}
                        </p>
                        <DueDate date={payment.date} />
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
