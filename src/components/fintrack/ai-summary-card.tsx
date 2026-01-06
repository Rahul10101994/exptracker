
"use client";

import * as React from "react";
import { Sparkles, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/contexts/transactions-context";
import { getFinancialSummary } from "@/ai/flows/financial-summary-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function AISummaryCard() {
  const { currentMonthTransactions } = useTransactions();
  const [summary, setSummary] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSummary() {
      if (currentMonthTransactions.length > 0) {
        setLoading(true);
        try {
          const result = await getFinancialSummary(currentMonthTransactions);
          setSummary(result);
        } catch (error) {
          console.error("Error fetching AI summary:", error);
          setSummary({ error: "Could not load AI insights." });
        } finally {
          setLoading(false);
        }
      } else {
        setSummary(null);
        setLoading(false);
      }
    }
    fetchSummary();
  }, [currentMonthTransactions]);

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
        </>
      );
    }
    if (!summary || summary.error) {
      return (
        <div className="text-center text-sm text-muted-foreground py-4">
           {summary?.error || "No transaction data available for analysis."}
        </div>
      );
    }
    return (
        <div className="space-y-3 text-sm">
            <div>
                <p className="font-semibold text-green-600">Good Job On:</p>
                <p>{summary.positiveObservation}</p>
            </div>
            <div>
                <p className="font-semibold text-orange-600">Watch Out For:</p>
                <p>{summary.areaForImprovement}</p>
            </div>
             <div>
                <p className="font-semibold text-blue-600">Suggestion:</p>
                <p>{summary.suggestion}</p>
            </div>
        </div>
    );
  };

  return (
    <Card className="border-primary/20 border-2 shadow-lg">
      <CardHeader className="p-4 pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Financial Summary
        </CardTitle>
        <Badge variant="outline" className="text-primary border-primary/50">
          New
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
