
"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface IconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
}

// Exclude specific icons that are not suitable for selection
const EXCLUDED_ICONS = new Set(['default', 'createLucideIcon', 'icons']);

export function IconPicker({ isOpen, onClose, onSelectIcon }: IconPickerProps) {
  const [search, setSearch] = React.useState("");

  const iconList = React.useMemo(() => {
    return Object.entries(LucideIcons)
      .filter(([name]) => !EXCLUDED_ICONS.has(name))
      .map(([name, component]) => ({ name, component }));
  }, []);

  const filteredIcons = React.useMemo(() => {
    if (!search) return iconList;
    return iconList.filter((icon) =>
      icon.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, iconList]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for an icon..."
            className="pl-10"
            autoFocus
          />
        </div>

        <ScrollArea className="flex-1 -mx-6">
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 px-6 py-4">
            {filteredIcons.map(({ name, component: Icon }) => (
              <Button
                key={name}
                variant="outline"
                size="icon"
                className="h-14 w-14 flex flex-col gap-1.5"
                onClick={() => {
                  onSelectIcon(name);
                  onClose();
                }}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[9px] truncate">{name}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
