import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/cn';
import { Milestone } from '@/contexts/Milestones/type';

interface MilestoneViewProps {
  index: number;
  milestone: Milestone;
}

const MilestoneView = ({ index, milestone }: MilestoneViewProps) => (
  <div className="rounded-lg bg-white p-[10px] md:px-4 md:py-3">
    <div className="justify-beetween mb-[10px] flex flex-row items-center">
      <div className="rounded-[20px] bg-primary-base px-5 py-[5px] font-sans text-sm leading-[140%] text-white">
        里程碑
        {' '}
        {index + 1}
      </div>
      <div
        className="
          ml-auto
          flex flex-row items-center gap-[3px]
          font-sans text-sm text-basic-300"
      >
        <p>
          {milestone.startDate
            ? format(new Date(milestone.startDate), 'yyyy/MM/dd')
            : format(new Date(), 'yyyy/MM/dd')}
        </p>
        <ArrowRight className="text-basic-300" />
        <p>
          {milestone.endDate
            ? format(new Date(milestone.endDate), 'yyyy/MM/dd')
            : format(new Date(), 'yyyy/MM/dd')}
        </p>
      </div>
    </div>
    <div className="flex flex-row items-center justify-between">
      <div className="flex w-full flex-col items-center gap-1  md:flex-row md:justify-between">
        <p
          className={cn(
            'font-sans text-sm text-basic-400',
            'w-full rounded-md px-3 py-2 border border-solid border-basic-200'
          )}
        >
          {milestone.name}
        </p>
      </div>
    </div>
  </div>
);

export default MilestoneView;
