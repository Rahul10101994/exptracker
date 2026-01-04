"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AddTransactionForm } from "./add-transaction-form";

export function AddTransactionSheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader>
          <SheetTitle>Add Transaction</SheetTitle>
        </SheetHeader>
        <AddTransactionForm onSubmit={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
