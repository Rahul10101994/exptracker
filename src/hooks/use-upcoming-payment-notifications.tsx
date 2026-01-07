
"use client";

import { useEffect, useState } from "react";
import { usePlannedPayments } from "@/contexts/planned-payment-context";
import { toast } from "@/hooks/use-toast";
import { differenceInDays, isToday, startOfDay } from "date-fns";
import { Bell } from "lucide-react";

const NOTIFICATION_SNOOZE_KEY = "payment_notification_snooze";
const SNOOZE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

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
    
    // Check if notifications are snoozed
    const snoozedUntil = localStorage.getItem(NOTIFICATION_SNOOZE_KEY);
    if (snoozedUntil && Date.now() < parseInt(snoozedUntil)) {
      return;
    }

    const today = startOfDay(new Date());

    const upcomingPayments = plannedPayments.filter((p) => {
      const paymentDate = startOfDay(new Date(p.date));
      const daysUntil = differenceInDays(paymentDate, today);
      return daysUntil >= -7 && daysUntil <= 1; // Overdue by up to a week, or due today or tomorrow
    });

    if (upcomingPayments.length > 0) {
      // Snooze notifications for 24 hours after showing them
      localStorage.setItem(NOTIFICATION_SNOOZE_KEY, (Date.now() + SNOOZE_DURATION_MS).toString());
      
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
        }, index * 500);

      });
    }

  }, [plannedPayments, isClient]);
}
