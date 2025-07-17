"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Save, X, Camera } from "lucide-react";
import { toast } from "sonner";
import PencilUTButton from "@/app/_components/pencilUTButton";
import { type getGroupById } from "@/server/groups/queries";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function GeneralSettings({
  group,
}: {
  group: Awaited<ReturnType<typeof getGroupById>>;
}) {
  const [groupImageUrl, setGroupImageUrl] = useState(group.imageUrl);
  const [groupName, setGroupName] = useState(group.name);
  const [groupDescription, setGroupDescription] = useState(
    group.description ?? "",
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const router = useRouter();

  const handleNameChange = (value: string) => {
    setGroupName(value);
    setHasChanges(
      value !== group.name || groupDescription !== (group.description ?? ""),
    );
  };

  const handleDescriptionChange = (value: string) => {
    setGroupDescription(value);
    setHasChanges(
      value !== (group.description ?? "") || groupName !== group.name,
    );
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
        }),
      });
      if (response.ok) {
        toast.success("Group settings updated successfully");
        setIsEditing(false);
        setHasChanges(false);
        router.refresh();
      } else {
        throw new Error("Failed to update group settings");
      }
    } catch (error) {
      console.error("Error updating group settings:", error);
      toast.error("Failed to update group settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setGroupName(group.name);
    setGroupDescription(group.description ?? "");
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleAvatarComplete = async (fileUrl: string) => {
    setIsLoading(true);
    setGroupImageUrl(fileUrl);
    setHasChanges(true);
    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: fileUrl }),
      });
      if (response.ok) {
        toast.success("Group photo updated successfully");
        setHasChanges(false);
      } else {
        throw new Error("Failed to update group photo");
      }
    } catch (error) {
      console.error("Error updating group photo:", error);
      toast.error("Failed to update group photo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Accordion type="multiple" className="space-y-4 p-4">
      <AccordionItem value="photo">
        <AccordionTrigger>
          <span className="flex items-center gap-2">
            <Camera className="h-5 w-5" /> Group Photo
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-2 ring-gray-200 dark:ring-gray-700">
                <AvatarImage src={groupImageUrl!} className="h-full w-full" />
                <AvatarFallback className="h-full w-full rounded-full bg-blue-900 text-xl font-bold text-white">
                  {group.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -right-2 -bottom-2">
                <PencilUTButton
                  uploadTo="groupUploader"
                  onComplete={handleAvatarComplete}
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="info">
        <AccordionTrigger>
          <span className="flex items-center gap-2">Group Information</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter group name"
                  className="flex-1"
                  disabled={!isEditing}
                />
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isLoading || !hasChanges}
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="groupDescription">Group Description</Label>
              <Input
                id="groupDescription"
                value={groupDescription}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Enter group description"
                className="flex-1"
                disabled={!isEditing}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="id">
        <AccordionTrigger>
          <span className="flex items-center gap-2">Group ID</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex items-center gap-2">
            <Input value={group.id} readOnly className="bg-muted flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(group.id);
                toast.success("Group ID copied to clipboard");
              }}
            >
              Copy
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
