import { useState } from 'react';
import OutcomeCard from '@/components/Outcome/Card';
import getProjectLayout from '@/layout/ProjectLayout';
import Button from '@/shared/components/Button';
import OutcomeCreate from '@/components/Outcome/Create';

const OutcomesPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex items-center justify-between body-md">
        <div className="text-basic-500">學習成果 (2)</div>
        <Button variant="solid" color="primary" onClick={() => setIsOpen(true)}>
          新增成果
        </Button>
      </div>
      <ul className="px-4 bg-basic-white flex flex-col rounded-2xl">
        <li className="py-6 border-b last:border-b-0 border-solid border-basic-200">
          <OutcomeCard
            className="p-3 transition-shadow hover:shadow-basic-200/40 hover:shadow-lg"
            detailLink={`/manage/project/outcomes/detail?id=${1}`}
          />
        </li>
        <li className="py-6 border-b last:border-b-0 border-solid border-basic-200">
          <OutcomeCard
            className="p-3 transition-shadow hover:shadow-basic-200/40 hover:shadow-lg"
            detailLink={`/manage/project/outcomes/detail?id=${2}`}
          />
        </li>
      </ul>
      <OutcomeCreate isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

OutcomesPage.getLayout = getProjectLayout;

export default OutcomesPage;
