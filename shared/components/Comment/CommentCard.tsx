import { useState } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { AiOutlineMore } from "react-icons/ai";
import { MdLockOpen, MdLock } from "react-icons/md";
import { useAuth } from "@/contexts/Auth";
import Image from "@/shared/components/Image";
import { ROLE } from "@/constants/member";
import { timeDuration } from "@/utils/date";
import { CommentSchema, CommentVisibility } from "@/services/modules/comments";
import { Button } from "@/components/atoms/button";
import Shell from "@/public/assets/icons/shell.svg";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/atoms/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import CommentInput, { CommentData } from "./CommentInput";

interface CommentCardProps extends CommentSchema {
  onCreate?: (data: Omit<CommentData, "id">) => void;
  onUpdate?: (data: CommentData) => void;
  onDelete?: (data: { id: number }) => void;
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
}: CommentCardProps) {
  const { user } = useAuth();
  const [isShowCommentInput, setIsShowCommentInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const role = ROLE.find((r) => r.value === commentUser?.roleList?.[0])?.label;
  const isSelf = user?._id === commentUser._id;
  const isPublic = visibility === "public";

  const actions = isSelf
    ? [
        onUpdate && {
          key: "toggleVisibility",
          children: isPublic ? "設為不公開" : "設為公開",
          onClick: () =>
            onUpdate({
              id,
              content,
              visibility: isPublic
                ? CommentVisibility.Private
                : CommentVisibility.Public,
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
          onClick: () =>
            window.open(
              "https://forms.gle/NkVbDWC3eXk4P4gv7",
              "_blank",
              "noopener"
            ),
        },
      ];

  const handleCreateComment = (data: Omit<CommentData, "id">) => {
    onCreate?.(data);
    setIsShowCommentInput(false);
  };

  if (!commentUser) return null;

  return (
    <div className="bg-white body-sm font-normal">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Image
            src={commentUser.photoURL}
            alt={`${commentUser.name}'s avatar`}
            width="30px"
            height="30px"
            borderRadius="9999px"
          />
          <div className="flex items-center gap-2">
            <span className="font-medium">{commentUser.name}</span>
            {role && (
              <div className="px-2.5 py-1 bg-basic-100 rounded">{role}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-basic-300">
          <time>{timeDuration(dayjs(updatedAt))}</time>
          <div className="hidden sm:flex items-center gap-0.5">
            {visibility === "public" ? <MdLockOpen /> : <MdLock />}
            <span>{visibility === "public" ? "公開" : "不公開"}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="-m-2 p-2">
              <AiOutlineMore />
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
          />
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
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
          className="-m-2 p-2"
          onClick={() => setIsShowCommentInput(true)}
        >
          回覆
        </Button>
      </div>

      {Array.isArray(replies) && replies.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger
            className="-mx-1 flex-row-reverse gap-2 text-primary-base"
            withIcon
          >
            <div>{replies.length} 則回覆</div>
            <Image
              src={replies[0].user.photoURL}
              alt={`${replies[0].user.name}'s avatar`}
              width="20px"
              height="20px"
              borderRadius="9999px"
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="pl-6 border-l border-solid border-basic-200">
              {replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  onCreate={onCreate}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
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
        />
      )}
    </div>
  );
}

export default CommentCard;
