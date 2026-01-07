
"use client";

import { useUpcomingPaymentNotifications } from "@/hooks/use-upcoming-payment-notifications";

/**
 * This is a client-side, invisible component that triggers the notification hook.
 * It doesn't render any UI itself.
 */
export function PaymentNotifier() {
  useUpcomingPaymentNotifications();
  return null;
}
