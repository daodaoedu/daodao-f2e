import { useState } from 'react';
import { LockKeyholeOpen, LockKeyhole } from 'lucide-react';
import Image from '@/shared/components/Image';
import { ROLE } from '@/constants/member';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';
import { cn } from '@/utils/cn';
import { CommentVisibility } from '@/services/comments';
import { Button } from '@/components/ui/button';
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
  defaultContent = '',
  defaultIsEditing = false,
  defaultIsPublic = true,
  onSubmit,
  onCancel,
}: CommentInputProps) {
  const { user } = useAuth();
  const { openLoginModal } = useAuthDispatch();
  const [content, setContent] = useState(defaultContent);
  const [isPublic, setIsPublic] = useState(defaultIsPublic);
  const [isEditing, setIsEditing] = useState(defaultIsEditing);
  const role = ROLE.find((r) => r.value === user?.roleList[0])?.label;

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
              src={user.photoURL}
              alt={`${user.name} avatar`}
              width="30px"
              height="30px"
              borderRadius="9999px"
            />
            <div>{user.name}</div>
            <div className="px-2.5 py-1 bg-basic-100 rounded">{role}</div>
          </div>
          {isEditing && (
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
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
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
