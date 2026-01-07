
"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AddPlannedPaymentForm } from "./add-planned-payment-form";

export function AddPlannedPaymentSheet({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent
        side="bottom"
        className="
          rounded-t-2xl
          px-4
          pb-safe
          max-h-[90vh]
          overflow-hidden
        "
      >
        {/* Grab Handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />

        <SheetHeader className="mb-2 text-left">
          <SheetTitle className="text-base sm:text-lg">
            Add Planned Payment
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable form handles its own scrolling */}
        <AddPlannedPaymentForm 
            onSubmit={() => setOpen(false)} 
        />
      </SheetContent>
    </Sheet>
  );
}
