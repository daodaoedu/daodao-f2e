'use client';

import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, Suspense } from 'react';
import OutcomeDetail from '@/features/projects/components/OutcomeDetail';
import SEOConfig from '@/components/SEOConfig';
import { useProject } from '@/services/projects';
import { useProjectOutcome } from '@/features/projects/hooks/outcome';
import { parseToNumber, parseToString } from '@/shared/lib/helper';
import { OutcomeDeleteModal, OutcomeUpdateModal } from '@/features/projects';
import { LazyCommentSection } from '@/features/comment';
import { CommentType } from '@/services/comments';

enum ModalTypeEnum {
  Update,
  Delete,
}

function OutcomeDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = parseToString(searchParams?.get('id'));
  const outcomeId = parseToNumber(searchParams?.get('outcomeId'));
  const [modalType, setModalType] = useState<ModalTypeEnum | null>(null);
  const { data: project } = useProject(projectId);
  const { data: outcome } = useProjectOutcome({
    projectId,
    outcomeId,
  });

  const SEOData = useMemo(
    () => ({
      title: `${outcome?.title} 學習成果｜島島阿學`,
      description:
        outcome?.content?.substring(0, 150) ||
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/assets/brand/horizontal-primary-logo.svg',
      link: `${process.env.PROD_URL}/manage/projects/outcomes/detail?id=${projectId}&outcomeId=${outcomeId}`,
    }),
    [outcome?.title, outcome?.content, projectId, outcomeId]
  );

  if (!projectId || outcomeId == null) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-basic-white">
      <SEOConfig {...SEOData} />
      <OutcomeDetail
        data={outcome}
        authorUser={project?.user}
        commentSection={
          <LazyCommentSection
            targetId={outcomeId}
            targetType={CommentType.Outcome}
          />
        }
        onEditClick={() => setModalType(ModalTypeEnum.Update)}
        onDeleteClick={() => setModalType(ModalTypeEnum.Delete)}
      />

      {outcome && project && (
        <OutcomeUpdateModal
          outcomeId={outcomeId}
          projectId={projectId}
          projectTitle={project.title}
          isOpen={modalType === ModalTypeEnum.Update}
          onClose={() => setModalType(null)}
          onSuccess={() => {
            toast.success('更新成功');
            setModalType(null);
          }}
        />
      )}

      <OutcomeDeleteModal
        projectId={projectId}
        outcomeId={outcomeId}
        isOpen={modalType === ModalTypeEnum.Delete}
        onClose={() => setModalType(null)}
        onSuccess={() => {
          toast.success('刪除成功');
          router.replace(`/manage/projects/outcomes?id=${projectId}`);
        }}
      />
    </div>
  );
}

export default function OutcomeDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OutcomeDetailPageContent />
    </Suspense>
  );
}
