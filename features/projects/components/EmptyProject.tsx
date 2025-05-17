import AccessDeniedImg from '@/public/assets/projects/access-denied.png';
import Button from '@/shared/components/Button';
import { cn } from '@/utils/cn';

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
          as="link"
          href="/personal-card/my-card"
          variant="outline"
          color="primary"
        >
          編輯名片
        </Button>
        <Button
          as="link"
          href="/manage/projects/create"
          variant="solid"
          color="primary"
        >
          新增計畫
        </Button>
      </div>
    </div>
  );
}
