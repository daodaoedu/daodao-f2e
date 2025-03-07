import toast from 'react-hot-toast';
import { useState } from 'react';
import IdeaCard from '@/components/Idea/Card';
import UpdateModal from '@/components/Idea/Modals/UpdateModal';
import ConfirmModal from '@/shared/components/Confirm';
import useIdea from '@/hooks/api/ideas/useIdea';
import useIdeaList from '@/hooks/api/ideas/useIdeaList';

// Update the Idea interface to include all necessary properties
interface Idea {
    id: string;
    title: string; // Add title property
    content: string; // Add content property
    imageUrls: string[] | null; // Add image_urls property
    visibility: string; // Add visibility property
}

enum ModalTypeEnum {
    Create,
    Update,
    Delete,
}

const IdeaList = () => {
    const [ideaId, setIdeaId] = useState<string | undefined>(undefined);
    const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);

    // 取得單筆創意詳細資料（用於編輯時預設資料）
    const { data: ideaDatail, mutate } = useIdea({ ideaId });

    // 取得所有創意清單，並設定編輯、刪除的回呼
    const { data: ideas, update, remove } = useIdeaList({
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

    function removeNumberSuffixStrict(id: string): string | null {
        if (!id || typeof id !== 'string') {
            return null;
        }

        // 使用正則表達式檢查是否以 -數字 結尾
        const match = id.match(/_\d+$/);
        if (!match) {
            return id; // 如果沒有匹配到 -數字 結尾，返回原字符串
        }

        // 移除匹配到的部分
        return id.substring(0, id.length - match[0].length);
    }

    const updatedIdeas = ideas?.data.map((idea: Idea) => {
        const newId = removeNumberSuffixStrict(idea.id);
        if (newId !== null) {
            return { ...idea, id: newId }; // 返回更新的 idea
        }
        return idea; // 返回原始 idea
    });

    return (
      <>
        <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl">
          {updatedIdeas?.map((idea: Idea) => (
            <li key={idea.id}>
              <IdeaCard
                data={idea}
                className="p-3 transition-shadow hover:shadow-basic-200/40 hover:shadow-lg"
                detailLink={`/ideas/detail?ideaId=${idea.id}`}
                onEditClick={() => {
                                setModalType(ModalTypeEnum.Update);
                                setIdeaId(idea.id);
                            }}
                onDeleteClick={() => {
                                setModalType(ModalTypeEnum.Delete);
                                setIdeaId(idea.id);
                            }}
              />
            </li>
          )) || <li>No ideas available.</li>}
        </ul>
        {modalType === ModalTypeEnum.Update && ideaDatail && ideaId && (
        <UpdateModal
          key={ideaId}
          id={ideaId}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          defaultValues={ideaDatail}
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
      </>
    );
};

export default IdeaList;
