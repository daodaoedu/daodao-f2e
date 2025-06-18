import toast from 'react-hot-toast';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import groupBannerImg from '@/public/assets/group-banner.png';
import Image from '@/shared/components/Image';
import InfoCompletionGuard from '@/shared/components/InfoCompletionGuard';
import CreateModal from '@/components/Idea/Modals/CreateModal';
import useIdeaList from '@/hooks/api/ideas/useIdeaList';

const Banner: React.FC = () => {
  enum ModalTypeEnum {
    Create,
    Update,
    Delete,
}
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);

    // 取得所有創意清單，並設定新增
    const { create } = useIdeaList({
      onCreated: () => {
          toast.success('新增成功');
          setModalType(null);
      }
  });
  return (
    <div className="relative">
      <picture className="absolute top-0 w-full h-[398px]">
        <Image
          src={groupBannerImg.src}
          alt="封面"
          height="inherit"
          background="linear-gradient(#fcfefe 10%, #e0f1f2 40%)"
          borderRadius="0"
          className="h-full"
        />
      </picture>
      <div className="relative flex flex-col items-center justify-center pt-[100px]">
        <h1 className="mb-2 font-bold text-[36px] leading-[140%] text-[#536166]">想法</h1>
        <p className="font-normal text-[14px] leading-[140%] text-[#536166]">
          歡迎分享最近在學什麼？
        </p>
        <p className="font-normal text-[14px] leading-[140%] text-[#536166]">
          註冊並加入我們，然後分享你的想法，讓更多人一起交流！
        </p>
        <InfoCompletionGuard>
          <Button
            variant="default"
            className="mt-4"
            onClick={() => setModalType(ModalTypeEnum.Create)}
          >
            我想分享
          </Button>
        </InfoCompletionGuard>
      </div>
      {modalType === ModalTypeEnum.Create && (
        <CreateModal
          isOpen={modalType === ModalTypeEnum.Create}
          onClose={() => setModalType(null)}
          isLoading={create.isMutating}
          onSubmit={create.trigger}
        />
      )}
    </div>
  );
};

export default Banner;
