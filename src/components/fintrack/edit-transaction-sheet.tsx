"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EditTransactionForm } from "./edit-transaction-form";
import { Transaction } from "@/contexts/transactions-context";

export function EditTransactionSheet({ children, transaction }: { children: React.ReactNode, transaction: Transaction }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild onClick={(e) => {
        // We stop propagation to avoid the DropdownMenu from closing
        e.stopPropagation();
        const target = e.target as HTMLElement;
        // The trigger is inside a dropdown menu item, we only open the sheet if we click the "Edit" item specifically
        if (target.textContent?.includes('Edit')) {
           setOpen(true);
        }
      }}>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader>
          <SheetTitle>Edit Transaction</SheetTitle>
        </SheetHeader>
        <EditTransactionForm transaction={transaction} onSubmit={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
