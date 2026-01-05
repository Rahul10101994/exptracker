
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
  initialBalance: z.coerce.number().default(0),
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
    addAccount({ name: values.name, initialBalance: values.initialBalance });
    toast({
      title: "Account Added",
      description: `The account "${values.name}" has been added.`,
    });
    form.reset();
    if (onSubmit) {
      onSubmit();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Savings Account" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="initialBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Balance</FormLabel>
              <FormControl>
                <Input type="number" placeholder="$0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Add Account</Button>
      </form>
    </Form>
  );
}
