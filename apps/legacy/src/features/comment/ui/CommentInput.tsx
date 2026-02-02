import { useCurrentUser } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { useState } from "react";
import type { UserProfile } from "@/entities/user/model";
import { ROLE_OPTIONS } from "@/entities/user/model/constants";
import { CommentVisibility } from "@/services/comments";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Image } from "@/shared/ui/image";
import Textarea from "../../../shared/components/Textarea";

export interface CommentData {
  id: number;
  content: string;
  visibility: CommentVisibility;
  parentId?: number;
}

interface CommentInputProps {
  placeholder?: string;
  parentId?: number;
  className?: string;
  hideHeader?: boolean;
  hideVisibilityToggle?: boolean;
  defaultContent?: string;
  defaultIsEditing?: boolean;
  defaultIsPublic?: boolean;
  onSubmit: (data: Omit<CommentData, "id">) => void;
  onCancel?: () => void;
}

function CommentInput({
  placeholder = "你的想法...",
  parentId,
  className,
  hideHeader = false,
  hideVisibilityToggle = false,
  defaultContent = "",
  defaultIsEditing = false,
  defaultIsPublic = true,
  onSubmit,
  onCancel,
}: CommentInputProps) {
  const { isAuthenticated, openLoginDialog } = useAuth();
  const { data: currentUserResponse } = useCurrentUser();
  // useCurrentUser 返回: { data: { success: true, data: FormattedUserResponse, timestamp: string } }
  // FormattedUserResponse 就是 UserProfile 的結構
  const fullUser = currentUserResponse?.data as UserProfile | undefined;
  const [content, setContent] = useState(defaultContent);
  const [isPublic, setIsPublic] = useState(defaultIsPublic);
  const [isEditing, setIsEditing] = useState(defaultIsEditing);
  const role = ROLE_OPTIONS.find((r) => r.value === fullUser?.roleList?.[0])?.label;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !fullUser) {
      openLoginDialog();
      return;
    }

    if (content.trim()) {
      onSubmit?.({
        content,
        visibility: isPublic ? CommentVisibility.Public : CommentVisibility.Private,
        parentId,
      });
      setContent("");
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    if (isAuthenticated && fullUser) {
      setIsEditing(true);
    } else {
      openLoginDialog();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    onCancel?.();
  };

  return (
    <div className={cn("body-sm", className)}>
      {!hideHeader && fullUser && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image
              src={fullUser.photoURL ?? ""}
              alt={`${fullUser.name} avatar`}
              width={30}
              height={30}
              className="rounded-full"
            />
            <div className="text-basic-500">{fullUser.name}</div>
            <div className="rounded bg-basic-100 px-2.5 py-1 text-basic-500">{role}</div>
          </div>
          {isEditing && !hideVisibilityToggle && (
            <Button
              className="-mb-1 mt-1 p-1"
              size="sm"
              variant="ghost"
              onClick={() => setIsPublic(!isPublic)}
            >
              {isPublic ? (
                <div className="flex items-center gap-1">
                  <LockKeyholeOpen />
                  <span>公開</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <LockKeyhole />
                  <span>私密</span>
                </div>
              )}
            </Button>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onClick={handleClick}
          placeholder={placeholder}
          className="w-full rounded-lg border border-basic-200 bg-white px-4 py-2 text-basic-500 placeholder:text-basic-300 focus:outline-none focus:ring-1 focus:ring-primary-base focus:border-primary-base"
          autoRows
        />
        {isEditing && (
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={handleCancel}>
              取消
            </Button>
            <Button variant="default" size="sm" type="submit" disabled={!content.trim()}>
              送出
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

export default CommentInput;
