import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '@/shared/components/Button';
import groupBannerImg from '@/public/assets/group-banner.png';
import Image from '@/shared/components/Image';
import InfoCompletionGuard from '@/shared/components/InfoCompletionGuard';
import CreateModal from '@/components/Idea/Modals/CreateModal';
import UpdateModal from '@/components/Idea/Modals/UpdateModal';
import ConfirmModal from '@/shared/components/Confirm';
import useIdea from '@/hooks/api/ideas/useIdea';
import useIdeaList from '@/hooks/api/ideas/useIdeaList';

const Banner: React.FC = () => {
  const router = useRouter();
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const [ideaId, setIdeaId] = useState<string | undefined>(undefined);

  enum ModalTypeEnum {
    Create,
    Update,
    Delete,
}
const { data: idea, mutate } = useIdea({ ideaId });

    // 取得所有創意清單，並設定新增、編輯、刪除的回呼
    const { data: ideas, create, update, remove } = useIdeaList({
      onCreated: () => {
          toast.success('新增成功');
          setModalType(null);
      },
      onUpdated: () => {
          toast.success('更新成功');
          setModalType(null);
          setIdeaId(undefined);
          mutate();
      },
      onDeleted: () => {
          toast.success('刪除成功');
          setModalType(null);
          setIdeaId(undefined);
      },
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
            variant="solid"
            color="primary"
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

      {modalType === ModalTypeEnum.Update && idea && ideaId && (
        <UpdateModal
          key={ideaId}
          id={ideaId}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          defaultValues={idea}
          isLoading={update.isMutating}
          onSubmit={update.trigger}
        />
      )}

      {ideaId && (
        <ConfirmModal
          title="確認刪除 Idea"
          confirmText="確認刪除"
          confirmColor="alert"
          isOpen={modalType === ModalTypeEnum.Delete}
          onClose={() => setModalType(null)}
          onConfirm={() => remove.trigger({ ideaId })}
          isLoading={remove.isMutating}
        />
      )}
    </div>
  );
};

export default Banner;