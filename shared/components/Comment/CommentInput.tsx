import { useState } from 'react';
import { MdLockOpen, MdLockOutline } from 'react-icons/md';
import Image from '@/shared/components/Image';
import { cn } from '@/utils/cn';
import { BaseUserSchema } from '@/services/users';
import { ROLE } from '@/constants/member';
import { CommentVisibility } from '@/services/comments';
import Button from '../Button';

export interface CommentData {
  id: number;
  content: string;
  visibility: CommentVisibility;
  parentId?: number;
}

interface CommentInputProps {
  loginUser: BaseUserSchema;
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
  loginUser,
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
  const [content, setContent] = useState(defaultContent);
  const role = ROLE.find((r) => r.value === loginUser.roleList[0])?.label;
  const [isPublic, setIsPublic] = useState(defaultIsPublic);
  const [isEditing, setIsEditing] = useState(defaultIsEditing);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleCancel = () => {
    setIsEditing(false);
    onCancel?.();
  };

  return (
    <div className={cn('body-sm', className)}>
      {!hideHeader && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image
              src={loginUser.photoURL}
              alt={`${loginUser.name} avatar`}
              width="30px"
              height="30px"
              borderRadius="9999px"
            />
            <div>{loginUser.name}</div>
            <div className="px-2.5 py-1 bg-basic-100 rounded">{role}</div>
          </div>
          {isEditing && (
            <Button
              className="-mb-1 mt-1 p-1"
              size="sm"
              onClick={() => setIsPublic(!isPublic)}
            >
              {isPublic ? (
                <div className="flex items-center gap-1">
                  <MdLockOpen />
                  <span>公開</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <MdLockOutline />
                  <span>私密</span>
                </div>
              )}
            </Button>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onClick={() => setIsEditing(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        {isEditing && (
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              color="primary"
              size="sm"
              onClick={handleCancel}
            >
              取消
            </Button>
            <Button
              variant="solid"
              color="primary"
              size="sm"
              isSubmit
              isDisabled={!content.trim()}
              onClick={handleSubmit}
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
