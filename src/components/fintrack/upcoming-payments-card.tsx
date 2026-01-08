
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlannedPayments } from '@/contexts/planned-payment-context';
import { isSameMonth, addMonths, format } from 'date-fns';
import { CalendarClock } from 'lucide-react';
import Link from 'next/link';

export function UpcomingPaymentsCard() {
  const { plannedPayments } = usePlannedPayments();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const { totalAmount, monthLabel } = React.useMemo(() => {
    const now = new Date();
    
    const currentMonthPayments = plannedPayments.filter(p => isSameMonth(new Date(p.date), now));
    const currentMonthTotal = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    if (currentMonthPayments.length > 0) {
      return {
        totalAmount: currentMonthTotal,
        monthLabel: format(now, 'MMMM'),
      };
    }

    const nextMonth = addMonths(now, 1);
    const nextMonthPayments = plannedPayments.filter(p => isSameMonth(new Date(p.date), nextMonth));
    const nextMonthTotal = nextMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalAmount: nextMonthTotal,
      monthLabel: format(nextMonth, 'MMMM'),
    };
  }, [plannedPayments]);

  if (!isClient) {
      return (
          <Card className="border-0 shadow-lg w-full">
              <CardHeader className="p-4 pb-2 flex-row items-center gap-3">
                  <CalendarClock className="h-5 w-5" />
                  <CardTitle className="text-sm sm:text-base font-medium">Upcoming Payments</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                  <div className="animate-pulse h-8 w-32 rounded-md bg-muted"></div>
              </CardContent>
          </Card>
      );
  }

  return (
    <Link href="/planned-payments">
        <Card className="border-0 shadow-lg w-full transition-shadow hover:shadow-xl">
        <CardHeader className="p-4 pb-2 flex-row items-center gap-3">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-sm sm:text-base font-medium">Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            {plannedPayments.length > 0 ? (
                <>
                    <p className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                        Total for {monthLabel}
                    </p>
                </>
            ) : (
                <p className="text-sm text-muted-foreground">No planned payments scheduled.</p>
            )}
        </CardContent>
        </Card>
    </Link>
  );
}
