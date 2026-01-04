"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AddGoalForm } from "./add-goal-form";

export function AddGoalSheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader>
          <SheetTitle>Add a New Goal</SheetTitle>
        </SheetHeader>
        <AddGoalForm onSubmit={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
