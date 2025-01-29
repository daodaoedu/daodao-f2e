import dayjs from 'dayjs';
import { AiOutlineMore } from 'react-icons/ai';
import { MdLockOutline } from 'react-icons/md';
import Image from '@/shared/components/Image';
import { timeDuration } from '@/utils/date';
import { cn } from '@/utils/cn';
import Button from '../Button';
import Collapse from '../Collapse';

interface CommentCardProps {
  avatar?: string;
  name?: string;
  tag?: string;
  className?: string;
  content?: string;
  children?: React.ReactNode;
}

function CommentCard({
  avatar,
  name,
  tag,
  content,
  children,
  className,
}: CommentCardProps) {
  return (
    <div className={cn('bg-white body-sm font-normal', className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Image
            src={avatar}
            alt={`${name}'s avatar`}
            width="30px"
            height="30px"
            borderRadius="9999px"
          />
          <div className="flex items-center gap-2">
            <span className="font-medium">{name}</span>
            {tag && (
              <div className="px-2.5 py-1 bg-basic-100 rounded">{tag}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-basic-300">
          <time>{timeDuration(dayjs())}</time>
          <div className="hidden sm:flex items-center gap-0.5">
            <MdLockOutline />
            <span>不公開</span>
          </div>
          <Button className="p-0">
            <AiOutlineMore />
          </Button>
        </div>
      </div>
      <p className="mb-2">{content}</p>
      <div className="mb-2 flex items-center gap-2 text-basic-black">
        <Button className="p-0" prefixIcon="Shell">
          2
        </Button>
        <Button className="p-0">回覆</Button>
      </div>
      {children && (
        <Collapse>
          <Collapse.Toggle
            className="-mx-1 flex-row-reverse gap-2 text-primary-base"
            withIcon
          >
            <div>1 則回覆</div>
            <Image
              src={avatar}
              alt={`${name}'s avatar`}
              width="20px"
              height="20px"
              borderRadius="9999px"
            />
          </Collapse.Toggle>
          <Collapse.List className="mt-3">
            <Collapse.Item>
              <div className="pl-6 border-l border-solid border-basic-200">
                {children}
              </div>
            </Collapse.Item>
          </Collapse.List>
        </Collapse>
      )}
    </div>
  );
}

export default CommentCard;
