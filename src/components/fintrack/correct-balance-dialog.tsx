"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccounts, Account } from "@/contexts/account-context";
import { toast } from "@/hooks/use-toast";

interface CorrectBalanceDialogProps {
  account: Account;
  currentBalance: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CorrectBalanceDialog({
  account,
  currentBalance,
  isOpen,
  onClose,
}: CorrectBalanceDialogProps) {
  const { correctBalance } = useAccounts();
  const [newBalance, setNewBalance] = React.useState<string>("");

  React.useEffect(() => {
    if (isOpen) {
      setNewBalance(currentBalance.toFixed(2));
    }
  }, [isOpen, currentBalance]);

  const handleCorrection = () => {
    const balanceValue = parseFloat(newBalance);

    if (!isNaN(balanceValue)) {
      correctBalance(account.id, balanceValue);

      toast({
        title: "Balance Corrected",
        description: `The balance for "${account.name}" has been updated.`,
      });

      onClose();
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid number for the balance.",
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent
        className="
          w-[95vw]
          max-w-md
          max-h-[85vh]
          overflow-y-auto
          rounded-lg
          pb-safe
        "
      >
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="text-base sm:text-lg">
            Correct Balance for{" "}
            <span className="capitalize">{account.name}</span>
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm">
            Enter the correct current balance for this account. An adjustment
            transaction will be created automatically.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Input */}
        <div className="space-y-2 py-2">
          <Label
            htmlFor="correct-balance"
            className="text-sm font-medium"
          >
            Correct Balance
          </Label>

          <Input
            id="correct-balance"
            type="number"
            inputMode="decimal"
            step="0.01"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            placeholder="₹0.00"
            className="h-11 text-base"
            autoFocus
          />
        </div>

        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={onClose}
            className="h-11"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleCorrection}
            className="h-11"
          >
            Save Correction
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
