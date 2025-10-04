'use client';

import { Button } from '@/shared/ui/button';
import { Image } from '@/shared/ui/image';
import { useDialog } from '@/contexts/Dialog';

interface ApplyButtonProps {
  className?: string;
  children: React.ReactNode;
}

export const ApplyButton = ({ className, children }: ApplyButtonProps) => {
  const { openDialog } = useDialog();

  const handleClickSignupButton = () => {
    openDialog({
      title: '活動申請已截止',
      content: (
        <>
          <div className="body-sm space-y-4">
            <p className="text-gray-600">
              本次活動申請已截止，但您仍可以加入排隊名單
            </p>
            <p className="text-gray-600">
              預計7月初開放申請，8月底申請截止。加入排隊清單後，我們會在下次開放申請時第一時間通知您。同時也歡迎追蹤社群媒體，接收最新活動訊息。
            </p>
          </div>

          <div className="relative h-64 w-full">
            <Image
              src="/assets/images/403-error.png"
              alt="Registration closed illustration"
              className="object-contain"
              fill
            />
          </div>
        </>
      ),
      className: 'p-0',
      cancelText: '稍後再說',
      confirmText: '加入排隊清單',
      onConfirm: () => {
        window.open('https://daoda.kit.com/marathon', '_blank', 'noopener');
      },
    });
  };

  return (
    <Button onClick={handleClickSignupButton} className={className}>
      {children}
    </Button>
  );
}
