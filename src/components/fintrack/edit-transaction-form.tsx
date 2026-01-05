
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import {
  useTransactions,
  Transaction,
  NewTransaction,
} from "@/contexts/transactions-context";
import { useAccounts } from "@/contexts/account-context";

/* ---------------- Schema ---------------- */

const formSchema = z
  .object({
    type: z.enum(["income", "expense"]),
    name: z.string().min(1, "Please enter a name."),
    amount: z.coerce.number().positive("Amount must be positive"),
    date: z.date(),
    category: z.string(),
    account: z.string(),
    spendingType: z.enum(["need", "want"]).optional(),
  })
  .refine(
    (data) => data.type === "income" || !!data.spendingType,
    {
      message: "Please select if this is a need or a want.",
      path: ["spendingType"],
    }
  );

const categories = {
  income: ["Freelance", "Salary", "Bonus", "Other"],
  expense: [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Subscription",
    "Investment",
    "Other",
  ],
};

/* ---------------- Component ---------------- */

export function EditTransactionForm({
  transaction,
  onSubmit,
}: {
  transaction: Transaction;
  onSubmit?: () => void;
}) {
  const { updateTransaction } = useTransactions();
  const { accounts } = useAccounts();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...transaction,
      date: new Date(transaction.date),
    },
  });

  const transactionType = form.watch("type");

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    updateTransaction(transaction.id, values as NewTransaction);

    toast({
      title: "Transaction Updated",
      description: `Successfully updated transaction: ${values.name}.`,
    });

    onSubmit?.();
  }

  return (
    <Form {...form}>
      {/* 🔽 SCROLLABLE BODY */}
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="
          space-y-5
          pt-4
          w-full
          max-h-[70vh]
          overflow-y-auto
          pr-1
        "
      >
        {/* Transaction Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Transaction Type
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("category", "");
                    if (value === "income") {
                      form.setValue("spendingType", undefined);
                      form.clearErrors("spendingType");
                    }
                  }}
                  className="grid grid-cols-2 gap-3"
                >
                  {["income", "expense"].map((t) => (
                    <label
                      key={t}
                      className="
                        flex items-center gap-3
                        border rounded-lg
                        px-4 py-3
                        cursor-pointer
                        text-sm
                        [&:has(:checked)]:border-primary
                        [&:has(:checked)]:bg-muted
                      "
                    >
                      <RadioGroupItem value={t} />
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Spotify"
                  className="h-11 text-base"
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="₹0.00"
                  className="h-11 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category + Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!transactionType}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {transactionType &&
                      categories[transactionType].map((c) => (
                        <SelectItem key={c} value={c.toLowerCase()}>
                          {c}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="account"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.name.toLowerCase()}>
                        <span className="capitalize">{a.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Need / Want */}
        {transactionType === "expense" && (
          <FormField
            control={form.control}
            name="spendingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>This is a…</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-2 gap-3"
                  >
                    {["need", "want"].map((t) => (
                      <label
                        key={t}
                        className="
                          flex items-center gap-3
                          border rounded-lg
                          px-4 py-3
                          cursor-pointer
                          [&:has(:checked)]:border-primary
                          [&:has(:checked)]:bg-muted
                        "
                      >
                        <RadioGroupItem value={t} />
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold"
        >
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
