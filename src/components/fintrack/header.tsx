
"use client";

import Link from "next/link";
import * as React from "react";
import { format } from "date-fns";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";

export function FinTrackHeader() {
  const [isMounted, setIsMounted] = React.useState(false);
  const currentDate = format(new Date(), "MMMM d");
  const userContext = useUser();
  const userName = userContext?.user?.displayName || 'User';

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header
      className="
        flex items-center justify-between
        pt-2
        gap-4
      "
    >
      {/* Left: Menu */}
      <div className="h-8 w-8">
        {isMounted && (
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Center: Name + Date */}
      <div className="flex items-baseline gap-2 text-center min-w-0">
        <h1 className="text-base sm:text-lg font-bold truncate">
          {userName}
        </h1>
        <p className="text-xs text-muted-foreground truncate">
          {currentDate}
        </p>
      </div>

      {/* Right: Placeholder for alignment */}
      <div className="h-8 w-8 shrink-0" />
    </header>
  );
}
