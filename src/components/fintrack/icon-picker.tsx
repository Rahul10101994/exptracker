"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const iconList = Object.keys(LucideIcons).filter(
  (key) =>
    key !== "createLucideIcon" &&
    key !== "LucideIcon" &&
    typeof (LucideIcons as any)[key] === "object"
);

interface IconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
}

export function IconPicker({
  isOpen,
  onClose,
  onSelectIcon,
}: IconPickerProps) {
  const [search, setSearch] = React.useState("");

  const filteredIcons = React.useMemo(() => {
    return iconList.filter((iconName) =>
      iconName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="
          rounded-t-2xl
          px-4
          pb-safe
          max-h-[90vh]
          flex
          flex-col
          overflow-hidden
        "
      >
        {/* Grab Handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />

        <SheetHeader className="mb-2 text-left">
          <SheetTitle className="text-base sm:text-lg">
            Choose an Icon
          </SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="pb-2">
          <Input
            placeholder="Search icons…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 text-base"
            autoFocus
          />
        </div>

        {/* Scrollable icon grid */}
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 p-2">
            {filteredIcons.map((iconName) => {
              const IconComponent = (LucideIcons as any)[iconName];

              return (
                <button
                  key={iconName}
                  onClick={() => {
                    onSelectIcon(iconName);
                    onClose();
                  }}
                  className="
                    aspect-square
                    rounded-xl
                    border
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-1
                    p-2
                    text-muted-foreground
                    transition
                    hover:bg-accent
                    active:scale-95
                  "
                >
                  <IconComponent className="h-6 w-6" />
                  <span className="text-[10px] truncate w-full text-center">
                    {iconName}
                  </span>
                </button>
              );
            })}

            {filteredIcons.length === 0 && (
              <div className="col-span-full text-center text-sm text-muted-foreground py-10">
                No icons found
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
