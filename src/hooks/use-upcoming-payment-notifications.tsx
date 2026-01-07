
"use client";

import { useEffect, useState } from "react";
import { usePlannedPayments } from "@/contexts/planned-payment-context";
import { toast } from "@/hooks/use-toast";
import { differenceInDays, isToday, startOfDay } from "date-fns";
import { Bell } from "lucide-react";

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
    
    const today = startOfDay(new Date());

    const upcomingPayments = plannedPayments.filter((p) => {
      const paymentDate = startOfDay(new Date(p.date));
      const daysUntil = differenceInDays(paymentDate, today);
      return daysUntil >= -7 && daysUntil <= 1; // Overdue by up to a week, or due today or tomorrow
    });

    if (upcomingPayments.length > 0) {
      upcomingPayments.forEach((payment, index) => {
        const paymentDate = startOfDay(new Date(payment.date));
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
        } else {
            // This handles the case for daysUntil > 1, which shouldn't happen with the current filter
            // but is good for safety.
             description += `in ${daysUntil} days.`;
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
                duration: 10000, // Show for 10 seconds
            });
        }, index * 600); 

      });
    }

  }, [plannedPayments, isClient]);
}
