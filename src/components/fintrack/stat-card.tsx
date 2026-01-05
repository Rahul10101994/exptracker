"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  valueClassName?: string;
}

export function StatCard({ label, value, valueClassName }: StatCardProps) {
  return (
    <Card className="border-0 shadow-lg w-full h-20">
      <CardContent className="flex flex-col items-center justify-center h-full p-4 gap-1">
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</p>
        <p className={cn("text-xl sm:text-2xl font-bold truncate", valueClassName)}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
