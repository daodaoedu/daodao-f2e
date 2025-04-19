import { useRouter } from 'next/router';
import { ContentCard } from '@/features/projects';
import getPublicProjectLayout from '@/layout/PublicProjectLayout';
import { useProjectOutcomes } from '@/services/modules/projects';
import { parseToString } from '@/services/core';

const OutcomesPage = () => {
  const { query } = useRouter();
  const projectId = parseToString(query.id);

  const { data: outcomes } = useProjectOutcomes(projectId);

  if (!projectId) {
    return <div>專案不存在</div>;
  }

  return (
    <>
      <ul className="px-4 bg-basic-white flex flex-col rounded-2xl">
        {outcomes?.map((outcome) => (
          <li
            key={outcome.id}
            className="py-6 border-b last:border-b-0 border-solid border-basic-200"
          >
            <ContentCard
              type="outcome"
              data={outcome}
              className="p-3 transition-shadow hover:shadow-basic-200/40 hover:shadow-lg"
              detailLink={`/projects/outcomes/detail?id=${projectId}&outcomeId=${outcome.id}`}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

OutcomesPage.getLayout = getPublicProjectLayout;

export default OutcomesPage;
