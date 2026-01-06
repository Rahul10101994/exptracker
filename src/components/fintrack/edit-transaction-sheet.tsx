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

export function EditTransactionSheet({
  transaction,
  isOpen,
  onClose,
}: EditTransactionSheetProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
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
        {/* Grab handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />

        <SheetHeader className="mb-2 text-left">
          <SheetTitle className="text-base sm:text-lg">
            Edit Transaction
          </SheetTitle>
        </SheetHeader>

        {/* Form handles its own scrolling */}
        <EditTransactionForm
          transaction={transaction}
          onSubmit={onClose}
        />
      </SheetContent>
    </Sheet>
  );
}
