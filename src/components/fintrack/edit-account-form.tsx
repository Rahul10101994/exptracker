
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
import { useAccounts, Account } from "@/contexts/account-context";

const formSchema = z.object({
  name: z.string().min(1, "Please enter a name for the account."),
  initialBalance: z.coerce.number().default(0),
});

export function EditAccountForm({
  account,
  onSubmit,
}: {
  account: Account;
  onSubmit?: () => void;
}) {
  const { updateAccount } = useAccounts();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: account.name,
      initialBalance: account.initialBalance,
    },
  });

  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    await updateAccount(account.id, values);

    toast({
      title: "Account Updated",
      description: `Successfully updated account: ${values.name}.`,
    });

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
          max-h-[70vh]
          overflow-y-auto
          pr-1
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
                  autoFocus
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
