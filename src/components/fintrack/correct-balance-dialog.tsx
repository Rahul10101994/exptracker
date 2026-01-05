
"use client";

import * as React from 'react';
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
import { toast } from '@/hooks/use-toast';

interface CorrectBalanceDialogProps {
  account: Account;
  currentBalance: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CorrectBalanceDialog({ account, currentBalance, isOpen, onClose }: CorrectBalanceDialogProps) {
  const { correctBalance } = useAccounts();
  const [newBalance, setNewBalance] = React.useState<number | string>(currentBalance.toFixed(2));
  
  React.useEffect(() => {
    if (isOpen) {
      setNewBalance(currentBalance.toFixed(2));
    }
  }, [isOpen, currentBalance])

  const handleCorrection = () => {
    const balanceValue = parseFloat(newBalance as string);
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Correct Balance for <span className="capitalize">{account.name}</span></AlertDialogTitle>
          <AlertDialogDescription>
            Enter the correct current balance for this account. The app will create an adjustment to match this amount.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
            <Label htmlFor="correct-balance">Correct Balance</Label>
            <Input
                id="correct-balance"
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder="0.00"
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleCorrection}>Save Correction</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
