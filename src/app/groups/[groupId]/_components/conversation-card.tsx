import { Clock, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import type { getGroupChat } from "@/server/conversations/queries";
import type { getGroupById } from "@/server/groups/queries";

export default function ConversationCard({
  conversation,
  group,
}: {
  conversation: Awaited<ReturnType<typeof getGroupChat>>;
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
  if (!conversation) return null;

  const lastMessage = conversation.messages[conversation.messages.length - 1];

  return (
    <Link
      key={conversation.id}
      href={`/groups/${group.id}/chat/${conversation.id}`}
    >
      <Card className="group max-w-xs cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md md:max-w-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <MessageCircle className="text-primary h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-base font-semibold">
                  {conversation.name ?? "General Chat"}
                </CardTitle>
                <p className="text-muted-foreground mt-1 text-xs"></p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Last Message Preview */}
            {lastMessage ? (
              <div className="flex items-start gap-2">
                <p className="text-muted-foreground text-xs">Last message:</p>
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarImage
                    src={lastMessage?.sender?.profileImageUrl ?? ""}
                  />
                  <AvatarFallback className="text-xs">
                    {lastMessage?.sender?.displayName?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-xs font-medium">
                    {lastMessage?.sender?.displayName ?? "Unknown"}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {lastMessage?.content ?? "No messages yet"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">No messages yet</span>
              </div>
            )}

            {/* Chat Stats */}
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{conversation.participants?.length || 0} members</span>
              </div>
              {conversation.messages && conversation.messages.length > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(
                      conversation.messages[0]?.createdAt ?? Date.now(),
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
