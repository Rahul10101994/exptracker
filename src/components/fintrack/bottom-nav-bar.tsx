
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Landmark, BarChart, Target, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTransactionSheet } from '@/components/fintrack/add-transaction-sheet';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/budget', label: 'Budget', icon: Landmark },
  { href: '/report', label: 'Report', icon: BarChart },
  { href: '/goal', label: 'Goal', icon: Target },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 flex h-20 items-center justify-around border-t bg-background/95 backdrop-blur-sm max-w-sm mx-auto">
      {navItems.slice(0, 2).map((item) => (
        <Link href={item.href} key={item.href} className="flex flex-col items-center gap-1 text-muted-foreground">
          <item.icon className={cn('h-6 w-6', pathname === item.href && 'text-primary')} />
          <span className={cn('text-xs', pathname === item.href && 'text-primary')}>{item.label}</span>
        </Link>
      ))}
      
      <div className="relative -top-6">
        <AddTransactionSheet>
          <Button size="icon" className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
            <Plus className="h-8 w-8" />
            <span className="sr-only">Add Transaction</span>
          </Button>
        </AddTransactionSheet>
      </div>

      {navItems.slice(2).map((item) => (
        <Link href={item.href} key={item.href} className="flex flex-col items-center gap-1 text-muted-foreground">
          <item.icon className={cn('h-6 w-6', pathname === item.href && 'text-primary')} />
          <span className={cn('text-xs', pathname === item.href && 'text-primary')}>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
