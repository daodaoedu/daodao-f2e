import AccessDeniedImg from '@/public/assets/projects/access-denied.png';
import { Button } from '@/components/atoms/button';
import { cn } from '@/utils/cn';
import Link from 'next/link';

export default function EmptyProject() {
  return (
    <div
      className={cn(
        'bg-white py-[18px] px-6 md:py-7 md:px-[42px]',
        'flex flex-col gap-3 items-center rounded-2xl'
      )}
    >
      <p className="font-sans text-basic-400 font-bold body-sm">
        目前沒有任何計畫
      </p>
      <img
        src={AccessDeniedImg.src}
        alt="沒有計劃"
        className="w-[232px] h-[180px]
        md:w-80 md:h-[280px]"
      />
      <p className="font-sans text-basic-400 body-md">你可以⋯</p>
      <div className="w-full flex flex-col gap-3 justify-center md:flex-row">
        <Button
          asChild
          variant="outline"
        >
          <Link href="/personal-card/my-card">
            編輯名片
          </Link>
        </Button>
        <Button
          asChild
          variant="default"
        >
          <Link href="/manage/projects/create">
            新增計畫
          </Link>
        </Button>
      </div>
    </div>
  );
}
