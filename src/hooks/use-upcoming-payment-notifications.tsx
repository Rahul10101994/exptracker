
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePlannedPayments } from "@/contexts/planned-payment-context";
import { toast } from "@/hooks/use-toast";
import { differenceInDays } from "date-fns";
import { Bell } from "lucide-react";
import { ToastAction } from "@/components/ui/toast";

export function useUpcomingPaymentNotifications() {
  const { plannedPayments } = usePlannedPayments();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) {
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingPayments = plannedPayments.filter((p) => {
      const paymentDate = new Date(p.date);
      paymentDate.setHours(0, 0, 0, 0);
      const daysUntil = differenceInDays(paymentDate, today);
      // Notify for payments due in the next day, today, or are overdue by up to a week.
      return daysUntil <= 1 && daysUntil >= -7;
    });

    if (upcomingPayments.length > 0) {
      upcomingPayments.forEach((payment, index) => {
        const paymentDate = new Date(payment.date);
        paymentDate.setHours(0, 0, 0, 0);
        const daysUntil = differenceInDays(paymentDate, today);

        let title = "Upcoming Payment";
        let description = `Your payment for "${payment.name}" of ₹${payment.amount} is due `;

        if (daysUntil === 1) {
            description += 'tomorrow.';
        } else if (daysUntil === 0) {
            title = "Payment Due Today";
            description = `Your payment for "${payment.name}" of ₹${payment.amount} is due today.`;
        } else if (daysUntil < 0) {
            title = "Payment Overdue";
            description = `Your payment for "${payment.name}" of ₹${payment.amount} was due ${Math.abs(daysUntil)} day(s) ago.`;
        }

        // Delay each toast slightly to prevent them from overlapping
        setTimeout(() => {
            toast({
                title: (
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        <span>{title}</span>
                    </div>
                ),
                description: description,
                duration: 10000,
                action: (
                  <ToastAction asChild altText="View planned payments">
                    <Link href="/planned-payments">View</Link>
                  </ToastAction>
                )
            });
        }, index * 600); 

      });
    }

  }, [plannedPayments, isClient]);
}
