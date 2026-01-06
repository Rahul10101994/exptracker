
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { useGoals, Goal } from "@/contexts/goal-context";

const formSchema = z.object({
  name: z.string().min(1, "Please enter a name."),
  targetAmount: z.coerce.number().positive("Target amount must be positive"),
  type: z.enum(["monthly", "yearly", "long-term"], {
    required_error: "You need to select a goal type.",
  }),
});

export function EditGoalForm({
  goal,
  onSubmit,
}: {
  goal: Goal;
  onSubmit?: () => void;
}) {
  const { updateGoal } = useGoals();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: goal.name,
      targetAmount: goal.targetAmount,
      type: goal.type,
    },
  });

  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    await updateGoal(goal.id, values);
    toast({
      title: "Goal Updated",
      description: `Successfully updated goal: ${values.name}.`,
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
                <FormLabel>Goal Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. New Laptop" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="₹0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Goal Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-wrap gap-x-4 gap-y-2"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="monthly" />
                    </FormControl>
                    <FormLabel className="font-normal">Monthly</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="yearly" />
                    </FormControl>
                    <FormLabel className="font-normal">Yearly</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="long-term" />
                    </FormControl>
                    <FormLabel className="font-normal">Long Term</FormLabel>
                  </FormItem>
                </RadioGroup>
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
