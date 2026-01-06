
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import * as React from "react";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { useTransactions } from "@/contexts/transactions-context";
import { useAccounts } from "@/contexts/account-context";
import { useBudget } from "@/contexts/budget-context";
import { Checkbox } from "@/components/ui/checkbox";

/* ---------------- Schema ---------------- */

const formSchema = z
  .object({
    type: z.enum(["income", "expense"]),
    name: z.string().min(1, "Please enter a description."),
    amount: z.coerce.number().positive("Amount must be positive"),
    date: z.date(),
    category: z.string().min(1, "Please select a category."),
    account: z.string().min(1, "Please select an account."),
    spendingType: z.enum(["need", "want"]).optional(),
    recurring: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.type === "expense") {
        return !!data.spendingType;
      }
      return true;
    },
    {
      message: "Please select if this is a need or a want.",
      path: ["spendingType"],
    }
  );

/* ---------------- Data ---------------- */

const smartCategoryMap: Record<string, string> = {
  spotify: "subscription",
  netflix: "subscription",
  prime: "subscription",
  uber: "transport",
  ola: "transport",
  swiggy: "food",
  zomato: "food",
  amazon: "shopping",
  flipkart: "shopping",
  rent: "bills",
  electricity: "bills",
};

/* ---------------- Component ---------------- */

export function AddTransactionForm({ onSubmit }: { onSubmit?: () => void }) {
  const { addTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { budgets } = useBudget();

  const categories = React.useMemo(() => {
    const expenseCategories = Object.keys(budgets);
    return {
        income: ["Freelance", "Salary", "Bonus", "Other"],
        expense: expenseCategories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
    }
  }, [budgets]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      date: new Date(),
      recurring: false,
    },
  });

  const transactionType = form.watch("type");

  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    await addTransaction(values);

    toast({
      title: "Transaction Added",
      description: `Added ${values.type} of ₹${values.amount}`,
    });

    form.reset({
      type: "expense",
      name: "",
      amount: 0,
      date: new Date(),
      recurring: false,
    });

    onSubmit?.();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-5 pt-4 w-full max-h-[70vh] overflow-y-auto pr-1"
      >
        {/* Transaction Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
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
                      className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer [&:has(:checked)]:border-primary [&:has(:checked)]:bg-muted"
                    >
                      <RadioGroupItem value={t} />
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Spotify"
                  className="h-11 text-base"
                  onChange={(e) => {
                    field.onChange(e);
                    const value = e.target.value.toLowerCase();
                    const match = Object.keys(smartCategoryMap).find((k) =>
                      value.includes(k)
                    );
                    if (match && transactionType) {
                      form.setValue("category", smartCategoryMap[match]);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount + Date (SAME ROW) */}
        <div className="grid grid-cols-2 gap-4">
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
                    placeholder="₹0.00"
                    className="h-11 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={format(field.value, "yyyy-MM-dd")}
                    onChange={(e) =>
                      field.onChange(
                        new Date(e.target.value + "T00:00:00")
                      )
                    }
                    className="h-11 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category + Account (SAME ROW) */}
        <div className="grid grid-cols-2 gap-4">
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.name.toLowerCase()}>
                        {a.name}
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
                        className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer [&:has(:checked)]:border-primary [&:has(:checked)]:bg-muted"
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
        
        <FormField
          control={form.control}
          name="recurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Recurring Transaction</FormLabel>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full h-11 text-base font-semibold">
          Add Transaction
        </Button>
      </form>
    </Form>
  );
}
