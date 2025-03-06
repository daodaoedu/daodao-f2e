import toast from 'react-hot-toast';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import IdeaCard from '@/components/Idea/Card';
import Button from '@/shared/components/Button';
import CreateModal from '@/components/Idea/Modals/CreateModal';
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

    console.log('IdeaList - ideas:', ideas);
    console.log('IdeaList - idea:', idea);

    return (
        <>
            <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl">
                {ideas?.data.map((idea: Idea) => (
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
                ))}
            </ul>
        </>
    );
};

export default IdeaList;
