
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, startOfTomorrow } from "date-fns";
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
import { usePlannedPayments } from "@/contexts/planned-payment-context";
import { useAccounts } from "@/contexts/account-context";
import { useBudget } from "@/contexts/budget-context";

const formSchema = z
  .object({
    type: z.enum(["income", "expense", "investment"]),
    name: z.string().min(1, "Please enter a description."),
    amount: z.coerce.number().positive("Amount must be positive"),
    date: z.date().min(startOfTomorrow(), { message: "Date must be in the future." }),
    category: z.string().min(1, "Please select a category."),
    account: z.string().min(1, "Please select an account."),
    spendingType: z.enum(["need", "want"]).optional(),
    period: z.enum(['one-time', 'monthly', 'yearly']).default('one-time'),
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

export function AddPlannedPaymentForm({ onSubmit }: { onSubmit?: () => void }) {
  const { addPlannedPayment } = usePlannedPayments();
  const { accounts } = useAccounts();
  const { expenseBudgets, incomeCategories } = useBudget();

  const categories = React.useMemo(() => {
    const expenseCategories = Object.keys(expenseBudgets);
    return {
        income: incomeCategories,
        expense: expenseCategories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
        investment: ["Stocks", "Mutual Funds", "Crypto", "Other"],
    }
  }, [expenseBudgets, incomeCategories]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      name: "",
      amount: 0,
      date: undefined,
      category: "",
      account: "",
      period: 'one-time',
    },
  });

  const transactionType = form.watch("type");

  React.useEffect(() => {
    if (transactionType === 'investment') {
        form.setValue('category', 'investment');
    } else {
        if (transactionType === 'income') {
            form.setValue("spendingType", undefined);
            form.clearErrors("spendingType");
        }
    }
  }, [transactionType, form]);


  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    await addPlannedPayment(values);

    toast({
      title: "Planned Payment Added",
      description: `Added ${values.type} of ₹${values.amount} for ${format(values.date, "PPP")}`,
    });

    form.reset({
      type: "expense",
      name: "",
      amount: 0,
      date: undefined,
      category: '',
      account: '',
      period: 'one-time',
    });

    onSubmit?.();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-5 pt-4 w-full max-h-[70vh] overflow-y-auto pr-1"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Type</FormLabel>
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
                  className="grid grid-cols-3 gap-2"
                >
                  {["income", "expense", "investment"].map((t) => (
                    <label
                      key={t}
                      className="flex items-center justify-center gap-2 border rounded-lg p-2 text-xs cursor-pointer [&:has(:checked)]:border-primary [&:has(:checked)]:bg-accent"
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

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Rent"
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
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    min={format(startOfTomorrow(), "yyyy-MM-dd")}
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
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
                  disabled={!transactionType || transactionType === 'investment'}
                  >
                  <FormControl>
                      <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                      {transactionType &&
                      categories[transactionType].map((c: string) => (
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
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repeats</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-3 gap-2"
                >
                  {['one-time', 'monthly', 'yearly'].map((t) => (
                    <label
                      key={t}
                      className="flex items-center justify-center gap-2 border rounded-lg p-2 text-xs cursor-pointer [&:has(:checked)]:border-primary [&:has(:checked)]:bg-accent"
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
        
        <Button type="submit" className="w-full h-11 text-base font-semibold">
          Add Planned Payment
        </Button>
      </form>
    </Form>
  );
}
