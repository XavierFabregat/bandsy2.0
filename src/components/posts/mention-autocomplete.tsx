"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface MentionableUser {
  id: string;
  username: string;
  displayName: string | null;
  profileImageUrl: string | null;
  type: "user";
}

interface MentionableGroup {
  id: string;
  name: string;
  handle: string;
  imageUrl: string | null;
  type: "group";
  memberCount?: number;
}

type MentionableItem = MentionableUser | MentionableGroup;

interface MentionAutocompleteProps {
  query: string;
  onSelect: (item: MentionableItem) => void;
  onClose: () => void;
  position: { top: number; left: number };
  visible: boolean;
  className?: string;
}

export function MentionAutocomplete({
  query,
  onSelect,
  onClose,
  position,
  visible,
  className,
}: MentionAutocompleteProps) {
  const [items, setItems] = useState<MentionableItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock data - in real app, this would come from an API
  const mockUsers: MentionableUser[] = [
    {
      id: "1",
      username: "john_doe",
      displayName: "John Doe",
      profileImageUrl: null,
      type: "user",
    },
    {
      id: "2",
      username: "jane_smith",
      displayName: "Jane Smith",
      profileImageUrl: null,
      type: "user",
    },
    {
      id: "3",
      username: "mike_jones",
      displayName: "Mike Jones",
      profileImageUrl: null,
      type: "user",
    },
  ];

  const mockGroups: MentionableGroup[] = [
    {
      id: "1",
      name: "Rock Band Collective",
      handle: "rockband",
      imageUrl: null,
      type: "group",
      memberCount: 1250,
    },
    {
      id: "2",
      name: "Jazz Musicians",
      handle: "jazzmusicians",
      imageUrl: null,
      type: "group",
      memberCount: 892,
    },
    {
      id: "3",
      name: "Electronic Producers",
      handle: "electronicproducers",
      imageUrl: null,
      type: "group",
      memberCount: 2100,
    },
  ];

  useEffect(() => {
    if (!visible || !query) {
      setItems([]);
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const filteredUsers = mockUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.displayName?.toLowerCase().includes(query.toLowerCase()),
      );

      const filteredGroups = mockGroups.filter(
        (group) =>
          group.name.toLowerCase().includes(query.toLowerCase()) ||
          group.handle.toLowerCase().includes(query.toLowerCase()),
      );

      const allItems = [...filteredUsers, ...filteredGroups];
      setItems(allItems.slice(0, 8)); // Limit to 8 items
      setSelectedIndex(0);
      setLoading(false);
    }, 200);
  }, [query, visible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible || items.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (items[selectedIndex]) {
            onSelect(items[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    if (visible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [visible, items, selectedIndex, onSelect, onClose]);

  // Auto-scroll to selected item
  useEffect(() => {
    if (containerRef.current && visible) {
      const selectedElement = containerRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex, visible]);

  if (!visible || items.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed z-50"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <Card className={cn("w-80 border shadow-lg", className)}>
        <CardContent className="p-0">
          <div ref={containerRef} className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <Search className="mx-auto mb-2 h-5 w-5 animate-spin" />
                <p className="text-muted-foreground text-sm">Searching...</p>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 border-b p-3 transition-colors last:border-b-0",
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50",
                  )}
                  onClick={() => onSelect(item)}
                >
                  {/* Avatar */}
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        item.type === "user"
                          ? (item.profileImageUrl ?? undefined)
                          : (item.imageUrl ?? undefined)
                      }
                    />
                    <AvatarFallback className="text-xs">
                      {item.type === "user"
                        ? item.username.charAt(0).toUpperCase()
                        : item.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {item.type === "user"
                          ? (item.displayName ?? item.username)
                          : item.name}
                      </p>
                      <Badge
                        variant={item.type === "user" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {item.type === "user" ? (
                          <User className="mr-1 h-3 w-3" />
                        ) : (
                          <Users className="mr-1 h-3 w-3" />
                        )}
                        {item.type === "user" ? "User" : "Group"}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-muted-foreground text-xs">
                        @{item.type === "user" ? item.username : item.handle}
                      </p>
                      {item.type === "group" && item.memberCount && (
                        <span className="text-muted-foreground text-xs">
                          {item.memberCount.toLocaleString()} members
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing mention state
export function useMentions() {
  const [mentions, setMentions] = useState<
    Array<{
      id: string;
      type: "user" | "group";
      username: string;
      displayName: string;
      start: number;
      end: number;
    }>
  >([]);

  const addMention = (
    item: MentionableItem,
    start: number,
    end: number,
    displayName: string,
  ) => {
    const newMention = {
      id: item.id,
      type: item.type,
      username: item.type === "user" ? item.username : item.handle,
      displayName,
      start,
      end,
    };

    setMentions((prev) => [...prev, newMention]);
  };

  const removeMention = (id: string) => {
    setMentions((prev) => prev.filter((mention) => mention.id !== id));
  };

  const updateMentionPositions = (textChange: {
    start: number;
    end: number;
    insertedText: string;
  }) => {
    const lengthDifference =
      textChange.insertedText.length - (textChange.end - textChange.start);

    setMentions((prev) =>
      prev.map((mention) => {
        if (mention.start >= textChange.end) {
          return {
            ...mention,
            start: mention.start + lengthDifference,
            end: mention.end + lengthDifference,
          };
        }
        return mention;
      }),
    );
  };

  return {
    mentions,
    addMention,
    removeMention,
    updateMentionPositions,
    setMentions,
  };
}
