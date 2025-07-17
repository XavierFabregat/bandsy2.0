"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, X, Camera, Info, Edit, Hash, Copy } from "lucide-react";
import { toast } from "sonner";
import PencilUTButton from "@/app/_components/pencilUTButton";
import { type getGroupById } from "@/server/groups/queries";
import { useRouter } from "next/navigation";

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
  const [groupHandle, setGroupHandle] = useState(group.handle);
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

  const handleHandleChange = (value: string) => {
    setGroupHandle(value);
    setHasChanges(value !== group.handle);
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
          handle: groupHandle,
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
    <div className="space-y-8">
      {/* Group Photo Section */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Group Photo
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Upload or change your group&apos;s profile picture
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative">
            <Avatar className="h-24 w-24 shadow-lg ring-4 ring-white dark:ring-slate-700">
              <AvatarImage
                src={groupImageUrl!}
                className="h-full w-full object-cover"
              />
              <AvatarFallback className="h-full w-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-2xl font-bold text-white">
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
          <div className="text-center sm:text-left">
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              Recommended size: 400x400px
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              JPG, PNG or GIF. Max size: 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Group Information Section */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <Info className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Group Information
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Basic details about your group
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="groupName"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Group Name
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter group name"
                className="flex-1"
                disabled={!isEditing}
              />
              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isLoading || !hasChanges}
                    className="bg-green-600 hover:bg-green-700"
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

          <div className="space-y-2">
            <Label
              htmlFor="groupHandle"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Group Handle
            </Label>
            <Input
              id="groupHandle"
              value={groupHandle}
              onChange={(e) => handleHandleChange(e.target.value)}
              placeholder="Enter group handle"
              className="flex-1"
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="groupDescription"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Group Description
            </Label>
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
      </div>

      {/* Group ID Section */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
            <Hash className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Group ID
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Unique identifier for this group
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={group.id}
            readOnly
            className="flex-1 bg-white font-mono text-sm dark:bg-slate-900"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void navigator.clipboard.writeText(group.id);
              toast.success("Group ID copied to clipboard");
            }}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </div>
      </div>
    </div>
  );
}
