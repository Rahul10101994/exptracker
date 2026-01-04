import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

export function FinTrackHeader() {
  return (
    <header className="flex items-center justify-between pt-2">
      <div>
        <p className="text-muted-foreground">Hello,</p>
        <h1 className="text-2xl font-bold text-foreground">Brooklyn Simmons</h1>
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
