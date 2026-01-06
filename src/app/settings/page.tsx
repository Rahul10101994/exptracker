
"use client";

import * as React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinTrackLayout } from '@/components/fintrack/fintrack-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useTransactions } from '@/contexts/transactions-context';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const auth = useAuth();
    const { transactions } = useTransactions();
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleLogout = () => {
        if (auth) {
            signOut(auth).then(() => {
                router.push('/');
            });
        }
    };
    
    const handleDownload = () => {
        if (transactions.length === 0) {
            toast({
                description: "No transaction data to download."
            });
            return;
        }

        // CSV Headers
        const headers = ['id', 'type', 'name', 'amount', 'date', 'category', 'account', 'spendingType'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(t => [
                t.id,
                t.type,
                `"${t.name.replace(/"/g, '""')}"`, // Escape double quotes
                t.amount,
                t.date,
                t.category,
                t.account,
                t.spendingType || ''
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `fintrack-transactions-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
            title: "Download Started",
            description: "Your transaction data is being downloaded."
        })
    };

    if (!isMounted) {
        return null;
    }

    return (
        <FinTrackLayout>
            <header className="flex items-center pt-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="text-lg font-bold text-foreground mx-auto">Settings</h1>
                <div className="w-10"></div>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <Switch 
                            id="dark-mode"
                            checked={theme === 'dark'}
                            onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <Switch id="push-notifications" checked />
                    </div>
                    <Separator />
                     <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <Switch id="email-notifications" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Manage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0 flex flex-col">
                    <Link href="/accounts" className="flex items-center justify-between py-3">
                        <span>Accounts</span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" className="w-full" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Transaction Data
                    </Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    Logout
                  </Button>
                </CardContent>
            </Card>

        </FinTrackLayout>
    );
}
