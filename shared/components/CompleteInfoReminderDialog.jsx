import { useId } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/typography';
import illustrationImg from '@/public/assets/illustration.png';

export default function CompleteInfoReminderDialog({ isOpen, onClose }) {
  const id = useId();
  const titleId = `modal-title-${id}`;
  const descriptionId = `modal-description-${id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] w-full rounded-2xl p-8">
        <DialogHeader>
          <DialogTitle
            id={titleId}
            className="text-center text-[#536166] font-bold text-[22px] mb-2"
          >
            島主廣播
          </DialogTitle>
          <DialogDescription id={descriptionId}>
            <Text>
              Hello 為了讓其他島民能更認識你，要先請你至個人資料頁面完成填寫哦！(,,・ω・,,)
            </Text>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center my-10">
          <img
            src={illustrationImg.src}
            alt="填寫完能享有更完善的功能"
            height="204"
            className="h-[204px]"
          />
        </div>
        <div className="flex flex-row-reverse gap-2 mt-4">
          <Button
            asChild
            className="rounded-3xl text-white bg-[#16B9B3] shadow-md w-full"
            onClick={onClose}
          >
            <Link href="/personal-card">
              去填寫資料
            </Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-3xl bg-white text-[#1f4645] shadow-md w-full hover:bg-gray-100"
            onClick={onClose}
          >
            再等等
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
