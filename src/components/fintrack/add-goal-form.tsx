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
import { useGoals } from "@/contexts/goal-context";

const formSchema = z.object({
  name: z.string().min(1, "Please enter a name."),
  targetAmount: z.coerce.number().positive("Target amount must be positive"),
  type: z.enum(["recurring", "non-recurring"], {
    required_error: "You need to select a goal type.",
  }),
});

export function AddGoalForm({ onSubmit }: { onSubmit?: () => void }) {
  const { addGoal } = useGoals();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    addGoal(values);
    toast({
      title: "Goal Added",
      description: `Successfully added new goal: ${values.name}.`,
    });
    form.reset({ name: "", targetAmount: 0 });
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
                  <Input type="number" placeholder="$0.00" {...field} />
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
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="non-recurring" />
                    </FormControl>
                    <FormLabel className="font-normal">Non-Recurring</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="recurring" />
                    </FormControl>
                    <FormLabel className="font-normal">Recurring</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">Add Goal</Button>
      </form>
    </Form>
  );
}
