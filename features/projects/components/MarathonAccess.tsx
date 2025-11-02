import AccessDeniedImg from '@/public/assets/projects/access-denied.png';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/cn';
import { CustomLink } from '@/shared/ui/custom-link';
import { getUserProfileBasePath , useAuth } from '@/entities/user';
import useMarathonAccess from '../hooks/useMarathonAccess';

export default function MarathonAccess({ children }: React.PropsWithChildren) {
  const { user } = useAuth();
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
      <p className="body-sm font-sans font-bold text-basic-400">
        這裡目前只開放給
      </p>
      <h3 className="font-sans font-bold text-primary-darker">
        春季學習馬拉松
      </h3>
      <img
        src={AccessDeniedImg.src}
        alt="沒有權限"
        className="h-[180px] w-[232px]
        md:h-[280px] md:w-80"
      />
      <p className="body-sm font-sans font-bold text-basic-400">
        的夥伴使用喔～
      </p>
      <p className="body-md font-sans text-basic-400">你可以⋯</p>
      <div className="flex w-full flex-col justify-center gap-3 md:flex-row">
        <Button
          asChild
          variant="outline"
        >
          <CustomLink href={getUserProfileBasePath(user)}>
            編輯個人名片
          </CustomLink>
        </Button>
        <Button asChild variant="default">
          <CustomLink href="/resources">
            查看學習資源
          </CustomLink>
        </Button>
      </div>
    </div>
  );
}
