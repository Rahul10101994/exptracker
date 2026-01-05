
"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AddAccountForm } from "./add-account-form";

export function AddAccountSheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader>
          <SheetTitle>Add New Account</SheetTitle>
        </SheetHeader>
        <AddAccountForm onSubmit={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
