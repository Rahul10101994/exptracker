"use client";

import Link from "next/link";
import { format } from "date-fns";
import { MoreVertical, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FinTrackHeader() {
  const currentDate = format(new Date(), "MMMM d");

  return (
    <header
      className="
        flex items-center justify-between
        pt-2
        gap-4
      "
    >
      {/* Left: Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <MoreVertical className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-44"
        >
          <DropdownMenuItem asChild>
            <Link
              href="/settings"
              className="flex items-center"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Center: Name + Date */}
      <div className="flex items-baseline gap-2 text-center min-w-0">
        <h1 className="text-base sm:text-lg font-bold truncate">
          Brooklyn Simmons
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
