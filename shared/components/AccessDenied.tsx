import { useRouter } from 'next/router';
import AccessDeniedImg from '@/public/assets/projects/access-denied.png';
import Button from "@/shared/components/Button";

const AccessDenied = () => {
  const router = useRouter();
  return (
    <div className="
    bg-white
      py-[18px] px-6 md:py-7 md:px-[42px]
      flex flex-col gap-3 items-center
      rounded-2xl"
    >
      <p className="
        font-sans
      text-basic-400
        text-sm
        font-bold
        leading-[140%]
      "
      >
        這裡目前只開放給
      </p>
      <h3 className="font-sans text-[#39524E] font-bold">春季學習馬拉松</h3>
      <img
        src={AccessDeniedImg.src}
        alt="沒有權限"
        className="w-[232px] h-[180px]
        md:w-[360px] md:h-[280px]"
      />
      <p className="font-sans text-basic-400 text-sm font-bold leading-[140%]">的夥伴使用喔～</p>
      <p className="font-sans text-basic-400 text-base leading-[140%]">你可以⋯</p>
      <div className="w-full flex flex-col gap-3 justify-center md:flex-row">
        <Button
          id="editMyCardButton"
          onClick={() => router.push('/personal-card/my-card')}
          variant="outline"
          color="primary"
        >
          編輯個人名片
        </Button>
        <Button
          id="findResourcesButton"
          variant="solid"
          color="primary"
          onClick={() => router.push('/resources')}
        >
          查看學習資源
        </Button>
      </div>
    </div>
  );
};
export default AccessDenied;
