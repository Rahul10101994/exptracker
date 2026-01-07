
import * as React from 'react';
import { FinTrackLayout } from '@/components/fintrack/fintrack-layout';
import { TransactionsView } from '@/components/fintrack/transactions-view';
import { Skeleton } from '@/components/ui/skeleton';

function TransactionsPageSkeleton() {
    return (
        <FinTrackLayout>
            <header className="flex items-center pt-2">
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-6 w-32 mx-auto rounded-md" />
                <div className="w-10" />
            </header>
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="pt-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24 rounded-md" />
                                <Skeleton className="h-3 w-16 rounded-md" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-16 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </FinTrackLayout>
    );
}


export default function TransactionsPage() {
    return (
        <React.Suspense fallback={<TransactionsPageSkeleton />}>
            <TransactionsView />
        </React.Suspense>
    );
}
