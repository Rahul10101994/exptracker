
"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EditAccountForm } from "./edit-account-form";
import { Account } from "@/contexts/account-context";

export function EditAccountSheet({ children, account }: { children: React.ReactNode, account: Account }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader>
          <SheetTitle>Edit Account</SheetTitle>
        </SheetHeader>
        <EditAccountForm account={account} onSubmit={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

