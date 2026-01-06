"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EditAccountForm } from "./edit-account-form";
import { Account } from "@/contexts/account-context";

interface EditAccountSheetProps {
  account: Account;
  isOpen: boolean;
  onClose: () => void;
}

export function EditAccountSheet({
  account,
  isOpen,
  onClose,
}: EditAccountSheetProps) {
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
        {/* Grab Handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />

        <SheetHeader className="mb-2 text-left">
          <SheetTitle className="text-base sm:text-lg">
            Edit Account
          </SheetTitle>
        </SheetHeader>

        {/* Scroll handled inside form */}
        <EditAccountForm
          account={account}
          onSubmit={onClose}
        />
      </SheetContent>
    </Sheet>
  );
}
