import { useState } from 'react';
import { LockKeyholeOpen, LockKeyhole } from 'lucide-react';
import { Image } from '@/shared/ui/image';
import { ROLE } from '@/constants/member';
import { useSession, useSessionActions } from '@/entities/session';
import { cn } from '@/shared/lib/cn';
import { CommentVisibility } from '@/services/comments';
import { Button } from '@/shared/ui/button';
import Textarea from '../Textarea';

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
  onSubmit: (data: Omit<CommentData, 'id'>) => void;
  onCancel?: () => void;
}

function CommentInput({
  placeholder = '你的想法...',
  parentId,
  className,
  hideHeader = false,
  hideVisibilityToggle = false,
  defaultContent = '',
  defaultIsEditing = false,
  defaultIsPublic = true,
  onSubmit,
  onCancel,
}: CommentInputProps) {
  const { user } = useSession();
  const { openLoginModal } = useSessionActions();
  const [content, setContent] = useState(defaultContent);
  const [isPublic, setIsPublic] = useState(defaultIsPublic);
  const [isEditing, setIsEditing] = useState(defaultIsEditing);
  const role = ROLE.find((r) => r.value === user?.roleList?.[0])?.label;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      openLoginModal();
      return;
    }

    if (content.trim()) {
      onSubmit?.({
        content,
        visibility: isPublic
          ? CommentVisibility.Public
          : CommentVisibility.Private,
        parentId,
      });
      setContent('');
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    if (user) {
      setIsEditing(true);
    } else {
      openLoginModal();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    onCancel?.();
  };

  return (
    <div className={cn('body-sm', className)}>
      {!hideHeader && user && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image
              src={user.photoURL ?? ''}
              alt={`${user.name} avatar`}
              width={30}
              height={30}
              className="rounded-full"
            />
            <div className="text-basic-500">{user.name}</div>
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
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
            >
              取消
            </Button>
            <Button
              variant="default"
              size="sm"
              type="submit"
              disabled={!content.trim()}
            >
              送出
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

export default CommentInput;
