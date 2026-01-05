"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { toast } from "@/hooks/use-toast";
import { useAccounts } from "@/contexts/account-context";

const formSchema = z.object({
  name: z.string().min(1, "Please enter a name for the account."),
  initialBalance: z.coerce.number().min(0, "Balance cannot be negative").default(0),
});

export function AddAccountForm({ onSubmit }: { onSubmit?: () => void }) {
  const { addAccount } = useAccounts();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      initialBalance: 0,
    },
  });

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    addAccount({
      name: values.name,
      initialBalance: values.initialBalance,
    });

    toast({
      title: "Account Added",
      description: `The account "${values.name}" has been added.`,
    });

    form.reset();
    onSubmit?.();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="
          space-y-5
          pt-4
          w-full
          max-w-full
        "
      >
        {/* Account Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Account Name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Savings Account"
                  className="h-11 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Initial Balance */}
        <FormField
          control={form.control}
          name="initialBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Initial Balance
              </FormLabel>
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

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold"
        >
          Add Account
        </Button>
      </form>
    </Form>
  );
}
