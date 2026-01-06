
"use client";

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ThumbsUp, TrendingDown, Lightbulb, Calendar, TrendingUp, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinTrackLayout } from '@/components/fintrack/fintrack-layout';
import { useTransactions } from '@/contexts/transactions-context';
import { getFinancialSummary } from "@/ai/flows/financial-summary-flow";
import { Skeleton } from '@/components/ui/skeleton';

export default function AiReportsPage() {
    const { transactions } = useTransactions();
    const [summary, setSummary] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const hasFetched = React.useRef(false);

    React.useEffect(() => {
        async function fetchSummary() {
            if (transactions.length > 0 && !hasFetched.current) {
                hasFetched.current = true;
                setLoading(true);
                setError(null);
                try {
                    const result = await getFinancialSummary(transactions);
                    setSummary(result);
                } catch (error: any) {
                    console.error("Error fetching AI summary:", error);
                    setError(error.message || "An unknown error occurred.");
                    setSummary(null);
                } finally {
                    setLoading(false);
                }
            } else if (transactions.length === 0) {
                setSummary(null);
                setLoading(false);
            }
        }
        fetchSummary();
    }, [transactions]);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            );
        }
        if (error) {
            return (
                <div className="text-center text-destructive py-20">
                    <p className="font-bold">Couldn't load AI summary.</p>
                    <p className="text-xs mt-2">{error}</p>
                </div>
            );
        }
        if (!summary) {
            return (
                <div className="text-center text-muted-foreground py-20">
                    No transaction data available for AI analysis.
                </div>
            );
        }
        return (
            <div className="space-y-4">
                <InfoCard
                    icon={Sparkles}
                    title="Overall Summary"
                    content={summary.summary}
                    iconColor="text-primary"
                />
                 <InfoCard
                    icon={Calendar}
                    title="Monthly Analysis"
                    content={summary.monthlyAnalysis}
                    iconColor="text-purple-500"
                />
                <InfoCard
                    icon={BarChart}
                    title="Yearly Analysis"
                    content={summary.yearlyAnalysis}
                    iconColor="text-teal-500"
                />
                <InfoCard
                    icon={ThumbsUp}
                    title="Positive Observation"
                    content={summary.positiveObservation}
                    iconColor="text-green-500"
                />
                <InfoCard
                    icon={TrendingDown}
                    title="Area for Improvement"
                    content={summary.areaForImprovement}
                    iconColor="text-orange-500"
                />
                 <InfoCard
                    icon={TrendingUp}
                    title="Future Prediction"
                    content={summary.futurePrediction}
                    iconColor="text-indigo-500"
                />
                <InfoCard
                    icon={Lightbulb}
                    title="Actionable Suggestion"
                    content={summary.suggestion}
                    iconColor="text-blue-500"
                />
            </div>
        );
    };

    return (
        <FinTrackLayout>
            <header className="flex items-center pt-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings">
                        <ArrowLeft />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="text-lg font-bold text-foreground mx-auto">AI-Powered Report</h1>
                <div className="w-10"></div>
            </header>

            {renderContent()}

        </FinTrackLayout>
    );
}

function InfoCard({ icon: Icon, title, content, iconColor }: { icon: React.ElementType, title: string, content: string, iconColor: string }) {
    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="p-4 pb-2 flex-row items-center gap-3">
                <Icon className={`h-6 w-6 ${iconColor}`} />
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">{content}</p>
            </CardContent>
        </Card>
    );
}
