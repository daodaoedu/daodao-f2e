import { useId } from 'react';
import Comment from '@/public/assets/icons/comment.svg';
import PostCard from '@/shared/components/Post/PostCard';
import CommentInput from '@/shared/components/Comment/CommentInput';
import CommentCard from '@/shared/components/Comment/CommentCard';
import { cn } from '@/utils/cn';

interface RadioProps {
  id: string;
  name: string;
  value: string;
  children: React.ReactNode;
  className?: string;
  isChecked?: boolean;
}

function Radio({
  id,
  name,
  value,
  isChecked,
  children,
  className,
}: RadioProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'block p-2 bg-basic-100 rounded',
        isChecked && 'bg-primary-lightest',
        className
      )}
    >
      <input
        type="radio"
        className="[clip:rect(0,0,0,0)] absolute p-0 border-0 w-0 h-0 overflow-hidden"
        name={name}
        id={id}
        value={value}
        checked={isChecked}
      />
      {children}
    </label>
  );
}

function EmojiRadioGroup() {
  const id = useId();
  const generateId = (tag: string) => `${id}-${tag}`;

  const emojiOptions = [
    { value: 'happy', label: '開心', emoji: '😊' },
    { value: 'calm', label: '平靜', emoji: '😌' },
    { value: 'anxious', label: '焦慮', emoji: '😟' },
    { value: 'tired', label: '疲憊', emoji: '😫' },
    { value: 'frustrated', label: '沮喪', emoji: '😤' },
  ];

  return (
    <div className="flex gap-1">
      {emojiOptions.map((option) => (
        <Radio
          key={option.value}
          id={generateId(option.value)}
          name="emoji"
          value={option.value}
          isChecked={option.value === 'anxious'}
        >
          <div className="text-center">{option.emoji}</div>
          <div>{option.label}</div>
        </Radio>
      ))}
    </div>
  );
}

interface TenPointRadioGroupProps {
  value: string;
}

function TenPointRadioGroup({ value }: TenPointRadioGroupProps) {
  const id = useId();
  const generateId = (tag: string) => `${id}-${tag}`;

  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }, (_, index) => `${index + 1}`).map(
        (option) => (
          <Radio
            key={option}
            id={generateId(option)}
            name="emoji"
            value={option}
            isChecked={option === value}
            className="md:px-3"
          >
            {option}
          </Radio>
        )
      )}
    </div>
  );
}

function ReviewDetail() {
  return (
    <PostCard>
      <PostCard.Header
        title="學習計畫一"
        subtitle="第五週"
        tag="覆盤二"
        date="2024/12/11"
        viewCount={100}
        isLocked={false}
      />
      <ul className="ml-8 list-decimal marker:heading-sm body-md font-normal">
        <li className="mb-8">
          <h3 className="mb-4 heading-sm">這段時間的整體心情：</h3>
          <div className="-ml-6 pb-8 border-b border-solid border-basic-100">
            <div className="mb-4">
              <EmojiRadioGroup />
            </div>
            <p className="mb-2">其他</p>
            <p>我的回答內容，這裡是回答內容範例。</p>
          </div>
        </li>
        <li className="mb-8">
          <h3 className="mb-4 heading-sm">壓力程度：</h3>
          <div className="-ml-6 pb-8 border-b border-solid border-basic-100">
            <TenPointRadioGroup value="5" />
          </div>
        </li>
        <li className="mb-8">
          <h3 className="mb-4 heading-sm">學習回顧：</h3>
          <div className="-ml-6 pb-8 border-b border-solid border-basic-100">
            <p className="mb-4">學習動力</p>
            <div className="mb-4">
              <TenPointRadioGroup value="5" />
            </div>
            <p className="mb-4">這段時間，我的收穫與困難...</p>
            <p className="mb-4">我的回答內容，這裡是回答內容範例。</p>
          </div>
        </li>
        <li className="mb-5">
          <h3 className="mb-4 heading-sm">調整與規劃：</h3>
          <div className="-ml-6 pb-5 border-b border-solid border-basic-100">
            <p className="mb-4">為了更好的學習狀態，我會...</p>
            <p>更認真讀書，積極與導師溝通。</p>
          </div>
        </li>
      </ul>
      <PostCard.Reward shellCount={5} userName="用戶A" />
      <CommentInput className="px-4 py-6 border-b border-solid border-basic-200" />
      <div className="my-2 flex items-center gap-0.5 body-md text-basic-500">
        <Comment />
        <span>回覆 (1)</span>
      </div>
      <CommentCard
        avatar=""
        className="px-8 py-6 border border-solid border-basic-200 rounded-lg"
      >
        <CommentCard avatar="" />
      </CommentCard>
    </PostCard>
  );
}

export default ReviewDetail;
