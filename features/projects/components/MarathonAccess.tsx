import AccessDeniedImg from '@/public/assets/projects/access-denied.png';
import Button from '@/shared/components/Button';
import { cn } from '@/utils/cn';
import useMarathonAccess from '../hooks/useMarathonAccess';

export default function MarathonAccess({ children }: React.PropsWithChildren) {
  const hasMarathonAccess = useMarathonAccess();

  if (hasMarathonAccess) {
    return children;
  }

  return (
    <div
      className={cn(
        'bg-white py-[18px] px-6 md:py-7 md:px-[42px]',
        'flex flex-col gap-3 items-center rounded-2xl'
      )}
    >
      <p className="font-sans text-basic-400 font-bold body-sm">
        這裡目前只開放給
      </p>
      <h3 className="font-sans text-primary-darker font-bold">
        春季學習馬拉松
      </h3>
      <img
        src={AccessDeniedImg.src}
        alt="沒有權限"
        className="w-[232px] h-[180px]
        md:w-80 md:h-[280px]"
      />
      <p className="font-sans text-basic-400 font-bold body-sm">
        的夥伴使用喔～
      </p>
      <p className="font-sans text-basic-400 body-md">你可以⋯</p>
      <div className="w-full flex flex-col gap-3 justify-center md:flex-row">
        <Button
          as="link"
          href="/personal-card/my-card"
          variant="outline"
          color="primary"
        >
          編輯個人名片
        </Button>
        <Button as="link" href="/resources" variant="solid" color="primary">
          查看學習資源
        </Button>
      </div>
    </div>
  );
}
