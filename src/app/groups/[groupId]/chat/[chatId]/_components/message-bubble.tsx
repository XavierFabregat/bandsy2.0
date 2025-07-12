import type { Message } from "@/types/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MessageBubble({
  message,
  currentUserId,
}: {
  message: Message;
  currentUserId: string;
}) {
  const isOwn = message.sender?.id
    ? message.sender.clerkId === currentUserId
    : message.senderClerkId === currentUserId;
  return (
    <div
      key={`${message.id}`}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[75%] items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar - Only show for other person's messages */}
        {!isOwn && (
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarImage
              src={message.senderImage ?? message.sender?.profileImageUrl ?? ""}
            />
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              {message.senderName?.charAt(0) ??
                message.sender?.displayName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Message Bubble */}
        <div className="flex flex-col">
          {/* Sender Name - Only show for other person's messages */}
          {!isOwn && (
            <p className="text-muted-foreground mb-1 text-xs font-medium">
              {message.senderName ?? message.sender?.displayName}
            </p>
          )}

          {/* Message Content */}
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "rounded-bl-md bg-white shadow-sm dark:bg-gray-800"
            }`}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>
            <p
              className={`mt-1 text-xs ${
                isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
              }`}
            >
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
