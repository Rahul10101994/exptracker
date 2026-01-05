
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

export function EditAccountSheet({ account, isOpen, onClose }: EditAccountSheetProps) {

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader>
          <SheetTitle>Edit Account</SheetTitle>
        </SheetHeader>
        <EditAccountForm account={account} onSubmit={onClose} />
      </SheetContent>
    </Sheet>
  );
}
