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

export function AddAccountSheet({
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
          max-h-[85vh]
          overflow-y-auto
          sm:max-h-none
        "
      >
        {/* Grab Handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />

        <SheetHeader className="mb-4 text-left">
          <SheetTitle className="text-base sm:text-lg">
            Add New Account
          </SheetTitle>
        </SheetHeader>

        <AddAccountForm onSubmit={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
