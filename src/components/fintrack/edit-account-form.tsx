
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
import { useAccounts, Account, NewAccount } from "@/contexts/account-context";

const formSchema = z.object({
  name: z.string().min(1, "Please enter a name for the account."),
});

export function EditAccountForm({ account, onSubmit }: { account: Account, onSubmit?: () => void }) {
  const { updateAccount } = useAccounts();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: account.name,
    },
  });

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    updateAccount(account.id, values as NewAccount);
    toast({
      title: "Account Updated",
      description: `Successfully updated account: ${values.name}.`,
    });
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
        <Button type="submit" className="w-full">Save Changes</Button>
      </form>
    </Form>
  );
}
