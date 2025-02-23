import { useState } from 'react';
import Image from '@/shared/components/Image';
import { cn } from '@/utils/cn';

interface CommentInputProps {
  placeholder?: string;
  className?: string;
  onSubmit?: (content: string) => void;
}

function CommentInput({
  placeholder = '你的想法...',
  className,
  onSubmit,
}: CommentInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit?.(content);
      setContent('');
    }
  };

  return (
    <div className={cn('body-sm', className)}>
      <div className="mb-2 flex items-center gap-2">
        <Image
          src=""
          alt="avatar"
          width="30px"
          height="30px"
          borderRadius="9999px"
        />
        <div>用戶Ａ</div>
        <div className="px-2.5 py-1 bg-basic-100 rounded">學生</div>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </form>
    </div>
  );
}

export default CommentInput;
