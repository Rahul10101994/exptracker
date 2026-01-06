'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Landmark, BarChart, Target, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTransactionSheet } from '@/components/fintrack/add-transaction-sheet';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/budget', label: 'Budget', icon: Landmark },
  { href: '/report', label: 'Report', icon: BarChart },
  { href: '/goal', label: 'Goal', icon: Target },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        mx-auto
        max-w-sm
        border-t
        bg-background/95
        backdrop-blur
        pb-safe
      "
    >
      <div className="relative flex h-20 items-center justify-around">
        {/* Left items */}
        {navItems.slice(0, 2).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 text-muted-foreground transition-colors',
                active && 'text-primary'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Center FAB */}
        <div className="relative -top-6">
          <AddTransactionSheet>
            <Button
              size="icon"
              className="
                h-16 w-16
                rounded-full
                bg-primary
                text-primary-foreground
                shadow-xl
                hover:bg-primary/90
                active:scale-95
                transition-transform
              "
            >
              <Plus className="h-8 w-8" />
              <span className="sr-only">Add Transaction</span>
            </Button>
          </AddTransactionSheet>
        </div>

        {/* Right items */}
        {navItems.slice(2).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 text-muted-foreground transition-colors',
                active && 'text-primary'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
