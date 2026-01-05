
"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EditTransactionForm } from "./edit-transaction-form";
import { Transaction } from "@/contexts/transactions-context";

interface EditTransactionSheetProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTransactionSheet({ transaction, isOpen, onClose }: EditTransactionSheetProps) {

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader>
          <SheetTitle>Edit Transaction</SheetTitle>
        </SheetHeader>
        <EditTransactionForm transaction={transaction} onSubmit={onClose} />
      </SheetContent>
    </Sheet>
  );
}
