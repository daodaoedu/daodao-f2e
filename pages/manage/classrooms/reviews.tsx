import { AiOutlineMore } from 'react-icons/ai';
import Button from '@/shared/components/Button';
import ClassroomLayout from '@/layout/ClassroomLayout';
import { useState } from 'react';
import { cn } from '@/utils/cn';

const ClassroomDetail = () => {
  const [activeTab, setActiveTab] = useState(11);

  const tabs = [
    { label: '11 週', value: 11 },
    { label: '22 週', value: 22 },
  ];

  return (
    <>
      <h1 className="mb-6 heading-md">學習馬拉松</h1>
      <div className="mb-6 flex items-center gap-3.5">
        <h2 className="heading-md">所有復盤</h2>
        <p className="vertical-separator-left before:bg-basic-300 pl-3 body-md text-basic-300">
          共 22 週，已進行 2 週
        </p>
      </div>
      <ul className="flex gap-5 mb-6 border-b border-solid border-basic-200">
        {tabs.map((tab) => (
          <li className="flex-1">
            <Button
              className={cn(
                'w-full rounded-none',
                activeTab === tab.value &&
                  'border-b-4 border-solid border-primary-lighter text-primary-base pointer-events-none'
              )}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </Button>
          </li>
        ))}
      </ul>
      <ul>
        <li>
          <div className="p-10 bg-white rounded-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="px-5 py-2 body-sm bg-primary-base rounded-full text-white">
                  覆盤二
                </div>
                <div className="body-md text-basic-500">學習計畫一</div>
                <div className="body-md text-primary-base">第五週</div>
              </div>
              <div className="flex items-center gap-2">
                <div>填寫日期 2024/12/11</div>
                <Button className="p-0">
                  <AiOutlineMore className="size-5" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-6">
                <div>已繳交：2</div>
                <div>未繳交：20</div>
              </div>
              <Button size="sm" className="gap-1 px-3" suffixIcon="FaArrowRight">
                更多
              </Button>
            </div>
          </div>
        </li>
      </ul>
    </>
  );
};

ClassroomDetail.getLayout = ClassroomLayout;

export default ClassroomDetail;
