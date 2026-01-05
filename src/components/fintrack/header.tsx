"use client";

import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { MoreVertical, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const userAvatar = PlaceHolderImages.find(
  (p) => p.id === "user-avatar"
);

export function FinTrackHeader() {
  const currentDate = format(new Date(), "EEEE, MMMM d");

  return (
    <header
      className="
        flex items-center justify-between
        pt-2
        gap-2
      "
    >
      {/* Left: Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
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

          <DropdownMenuItem className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Center: Date + Name */}
      <div className="flex flex-col items-center text-center min-w-0">
        <p className="text-xs text-muted-foreground truncate">
          {currentDate}
        </p>
        <h1 className="text-base sm:text-lg font-bold truncate">
          Brooklyn Simmons
        </h1>
      </div>

      {/* Right: Avatar */}
      <Avatar className="h-11 w-11 shrink-0">
        {userAvatar && (
          <AvatarImage
            src={userAvatar.imageUrl}
            alt={userAvatar.description}
            width={44}
            height={44}
            data-ai-hint={userAvatar.imageHint}
          />
        )}
        <AvatarFallback>BS</AvatarFallback>
      </Avatar>
    </header>
  );
}
