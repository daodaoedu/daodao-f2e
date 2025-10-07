import { useId } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/typography';
import illustrationImg from '@/public/assets/images/review-passed.png';

export default function CompleteInfoReminderDialog({ isOpen, onClose }) {
  const id = useId();
  const titleId = `modal-title-${id}`;
  const descriptionId = `modal-description-${id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[400px] rounded-2xl p-8">
        <DialogHeader>
          <DialogTitle
            id={titleId}
            className="mb-2 text-center text-[22px] font-bold text-[#536166]"
          >
            島主廣播
          </DialogTitle>
          <DialogDescription id={descriptionId}>
            <Text>
              Hello 為了讓其他島民能更認識你，要先請你至個人資料頁面完成填寫哦！(,,・ω・,,)
            </Text>
          </DialogDescription>
        </DialogHeader>
        <div className="my-10 flex justify-center">
          <img
            src={illustrationImg.src}
            alt="填寫完能享有更完善的功能"
            height="204"
            className="h-[204px]"
          />
        </div>
        <div className="mt-4 flex flex-row-reverse gap-2">
          <Button
            asChild
            className="w-full rounded-3xl bg-[#16B9B3] text-white shadow-md"
            onClick={onClose}
          >
            <Link href="/personal-card">
              去填寫資料
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-3xl bg-white text-[#1f4645] shadow-md hover:bg-gray-100"
            onClick={onClose}
          >
            再等等
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
