import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useState } from 'react';
import IdeaDetail from '@/components/Idea/Detail';
import useIdea from '@/hooks/api/ideas/useIdea';
import ConfirmModal from '@/shared/components/Confirm';
import UpdateModal from '@/components/Idea/Modals/UpdateModal';
import { parseToString } from '@/utils/helper';

enum ModalTypeEnum {
    Update,
    Delete,
}

const IdeaDetailPage = () => {
    const router = useRouter();
    const { query } = router;
    const ideaId = parseToString(query.ideaId);
    const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);

    // 使用 useIdea hook 取得單筆 Idea 資料與 mutation 方法
    const { data: idea, update: onUpdated, remove: onDeleted } = useIdea({
        ideaId,
        onUpdated: () => {
            toast.success('更新成功');
            setModalType(null);
        },
        onDeleted: () => {
            toast.success('刪除成功');
            router.replace('/ideas');
        },
    });

    if (!ideaId) {
        return null;
    }

    return (
      <div className="min-h-screen bg-primary-palest ">
        <div className="min-h-screen bg-primary-palest flex items-center justify-center ">
          <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-3xl relative">
            {/* 返回按鈕 */}
            <button
              className="inline-block px-1 mb-2 text-[#536166] text-sm cursor-pointer"
              onClick={router.back}
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="pl-1">返回</span>
            </button>

            <IdeaDetail
              data={idea}
              onEditClick={() => setModalType(ModalTypeEnum.Update)}
              onDeleteClick={() => setModalType(ModalTypeEnum.Delete)}
            />

            {idea && (
            <UpdateModal
              id={ideaId}
              defaultValues={idea}
              isOpen={modalType === ModalTypeEnum.Update}
              onClose={() => setModalType(null)}
              onSubmit={onUpdated.trigger}
              isLoading={onUpdated.isMutating}
            />
                    )}

            <ConfirmModal
              title="確認刪除 Idea"
              confirmText="確認刪除"
              confirmColor="alert"
              isOpen={modalType === ModalTypeEnum.Delete}
              onClose={() => setModalType(null)}
              onConfirm={() => onDeleted.trigger({ ideaId })}
              isLoading={onDeleted.isMutating}
            />
          </div>
        </div>
      </div>
    );
};

export default IdeaDetailPage;
