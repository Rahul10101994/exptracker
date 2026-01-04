"use client";

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

export function FinTrackHeader() {
  const currentDate = format(new Date(), 'EEEE, MMMM d');

  return (
    <header className="flex items-center justify-between pt-2">
      <Button variant="ghost" size="icon">
        <MoreVertical />
        <span className="sr-only">Menu</span>
      </Button>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{currentDate}</p>
        <h1 className="text-lg font-bold text-foreground">Brooklyn Simmons</h1>
      </div>
      <Avatar className="h-12 w-12">
        {userAvatar && (
            <AvatarImage
                src={userAvatar.imageUrl}
                alt={userAvatar.description}
                width={48}
                height={48}
                data-ai-hint={userAvatar.imageHint}
            />
        )}
        <AvatarFallback>BS</AvatarFallback>
      </Avatar>
    </header>
  );
}
