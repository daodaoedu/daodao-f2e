import { useAuth } from "@daodao/auth";
import { EllipsisVertical, LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ROLE_OPTIONS } from "@/entities/user/model/constants";
import Shell from "@/public/assets/icons/shell.svg";
import { type CommentSchema, CommentVisibility } from "@/services/comments";
import { timeDuration } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Image } from "@/shared/ui/image";
import CommentInput, { type CommentData } from "./CommentInput";

interface CommentCardProps extends CommentSchema {
  onCreate?: (data: Omit<CommentData, "id">) => void;
  onUpdate?: (data: CommentData) => void;
  onDelete?: (data: { id: number }) => void;
  hideVisibilityToggle?: boolean;
}

function CommentCard({
  id,
  user: commentUser,
  content,
  visibility,
  replies,
  updatedAt,
  onCreate,
  onUpdate,
  onDelete,
  hideVisibilityToggle = false,
}: CommentCardProps) {
  const { user } = useAuth();
  const [isShowCommentInput, setIsShowCommentInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const role = ROLE_OPTIONS.find((r) => r.value === commentUser?.roleList?.[0])?.label;
  const isSelf = user?.id === commentUser?.id;
  const isPublic = visibility === "public";

  const actions = isSelf
    ? [
        !hideVisibilityToggle &&
          onUpdate && {
            key: "toggleVisibility",
            children: isPublic ? "設為不公開" : "設為公開",
            onClick: () =>
              onUpdate({
                id,
                content,
                visibility: isPublic ? CommentVisibility.Private : CommentVisibility.Public,
              }),
          },
        onUpdate && {
          key: "edit",
          children: "編輯",
          onClick: () => setIsEditing(true),
        },
        onDelete && {
          key: "delete",
          children: "刪除",
          onClick: () => onDelete({ id }),
        },
      ]
    : [
        {
          key: "report",
          children: "檢舉",
          onClick: () => window.open("https://forms.gle/NkVbDWC3eXk4P4gv7", "_blank", "noopener"),
        },
      ];

  const handleCreateComment = (data: Omit<CommentData, "id">) => {
    onCreate?.(data);
    setIsShowCommentInput(false);
  };

  if (!commentUser) return null;

  return (
    <div className="body-sm bg-white font-normal text-basic-500">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Image
            src={commentUser.photoURL}
            alt={`${commentUser.name}'s avatar`}
            width={30}
            height={30}
            className="rounded-full"
          />
          <div className="flex items-center gap-2">
            <span className="font-medium text-basic-500">{commentUser.name}</span>
            {role && <div className="rounded bg-basic-100 px-2.5 py-1">{role}</div>}
          </div>
        </div>
        <div className="flex items-center gap-3 text-basic-300">
          <time>{timeDuration(updatedAt)}</time>
          {!hideVisibilityToggle && (
            <div className="hidden items-center gap-0.5 sm:flex">
              {visibility === "public" ? <LockKeyholeOpen /> : <LockKeyhole />}
              <span>{visibility === "public" ? "公開" : "不公開"}</span>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="-m-2 p-2">
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-20 p-1">
              {actions.map(
                (action) =>
                  action && (
                    <DropdownMenuItem key={action.key} className="text-nowrap">
                      <Button
                        variant="ghost"
                        className="w-full hover:bg-primary-palest"
                        onClick={action.onClick}
                      >
                        {action.children}
                      </Button>
                    </DropdownMenuItem>
                  )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mb-2">
        {isEditing && onUpdate ? (
          <CommentInput
            defaultContent={content}
            defaultIsEditing
            defaultIsPublic={isPublic}
            onSubmit={(data) => {
              onUpdate({ ...data, id });
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            hideHeader
            hideVisibilityToggle={hideVisibilityToggle}
          />
        ) : (
          <p className="whitespace-pre-wrap text-basic-500">{content}</p>
        )}
      </div>
      <div className="mb-2 flex items-center gap-2 text-basic-black">
        <Button
          variant="ghost"
          className="p-0"
          onClick={() => toast.error("感謝您的貝殼，但此功能尚未開放")}
        >
          <Shell />
        </Button>
        <Button
          variant="ghost"
          className="-m-2 p-2 text-basic-500"
          onClick={() => setIsShowCommentInput(true)}
        >
          回覆
        </Button>
      </div>

      {Array.isArray(replies) && replies.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="-mx-1 flex-row-reverse gap-2 text-primary-base" withIcon>
            <div>{replies.length} 則回覆</div>
            <Image
              src={replies[0]?.user.photoURL ?? ""}
              alt={`${replies[0]?.user.name ?? "User"}'s avatar`}
              width={20}
              height={20}
              className="rounded-full"
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="border-l border-solid border-basic-200 pl-6">
              {replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  onCreate={onCreate}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  hideVisibilityToggle={hideVisibilityToggle}
                  {...reply}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {isShowCommentInput && (
        <CommentInput
          className="pb-4 pt-6"
          parentId={id}
          defaultIsEditing
          onSubmit={handleCreateComment}
          onCancel={() => setIsShowCommentInput(false)}
          hideVisibilityToggle={hideVisibilityToggle}
        />
      )}
    </div>
  );
}

export default CommentCard;
