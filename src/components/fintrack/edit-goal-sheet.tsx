
"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EditGoalForm } from "./edit-goal-form";
import { Goal } from "@/contexts/goal-context";

interface EditGoalSheetProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
}

export function EditGoalSheet({
  goal,
  isOpen,
  onClose,
}: EditGoalSheetProps) {
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
            Edit Goal
          </SheetTitle>
        </SheetHeader>

        <EditGoalForm
          goal={goal}
          onSubmit={onClose}
        />
      </SheetContent>
    </Sheet>
  );
}
