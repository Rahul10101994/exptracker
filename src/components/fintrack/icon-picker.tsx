
"use client";

import * as React from "react";
import * as LucideIcons from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const iconList = Object.keys(LucideIcons).filter(key => key !== 'createLucideIcon' && key !== 'LucideIcon' && typeof (LucideIcons as any)[key] === 'object');

interface IconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
}

export function IconPicker({ isOpen, onClose, onSelectIcon }: IconPickerProps) {
  const [search, setSearch] = React.useState("");

  const filteredIcons = React.useMemo(() => {
    return iconList.filter(iconName =>
      iconName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-lg h-4/5 flex flex-col">
        <SheetHeader>
          <SheetTitle>Choose an Icon</SheetTitle>
        </SheetHeader>
        <div className="p-2">
            <Input 
                placeholder="Search for an icon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <ScrollArea className="flex-grow">
            <div className="grid grid-cols-5 gap-4 p-4">
                {filteredIcons.map(iconName => {
                    const IconComponent = (LucideIcons as any)[iconName];
                    return (
                        <button
                            key={iconName}
                            onClick={() => onSelectIcon(iconName)}
                            className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-accent aspect-square"
                        >
                            <IconComponent className="h-6 w-6" />
                            <span className="text-xs text-center truncate">{iconName}</span>
                        </button>
                    )
                })}
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
