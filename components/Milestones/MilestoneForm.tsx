import { useEffect, useRef, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import dayjs from 'dayjs';
import { cn } from '@/utils/cn';
import { MdSend, MdClose } from 'react-icons/md';
import { CreateProjectMilestoneRequest } from '@/services/project/milestone';
import Button from '@/shared/components/Button';
import { numberToZh } from './Shared';

interface MilestoneFormProps {
  milestone: CreateProjectMilestoneRequest;
  disabledChangeDate: boolean;
  onCancel?: () => void;
  onSubmit: (milestone: CreateProjectMilestoneRequest) => void;
}

const MilestoneForm = ({
  milestone: overrideMilestone,
  disabledChangeDate,
  onCancel,
  onSubmit,
}: MilestoneFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [milestone, setMilestone] = useState<CreateProjectMilestoneRequest>({
    ...overrideMilestone,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setMilestone({
      ...milestone,
      [name]: value,
    });
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="p-[10px] md:py-3 md:px-4 rounded-lg bg-white">
      <div className="flex flex-row items-center justify-beetween mb-[10px]">
        <div className="bg-primary-base text-white py-[5px] px-5 rounded-[20px] font-sans text-sm leading-[140%]">
          第{numberToZh(milestone.week)}週
        </div>
        <div
          className="
          ml-auto
          flex flex-row items-center gap-[3px]
          font-sans text-sm text-basic-300"
        >
          {!disabledChangeDate && (
            <Button className="p-0">
              <MdSend />
            </Button>
          )}
          <p>
            {milestone.startDate
              ? dayjs(milestone.startDate).format('YYYY/MM/DD')
              : dayjs().format('YYYY/MM/DD')}
          </p>
          <FaArrowRight className="text-basic-300" />
          <p>
            {milestone.endDate
              ? dayjs(milestone.endDate).format('YYYY/MM/DD')
              : dayjs().format('YYYY/MM/DD')}
          </p>
        </div>
      </div>
      <div className="flex flex-row items-center justify-between">
        <div className="w-full flex flex-col md:flex-row items-center  md:justify-between gap-1">
          <input
            ref={inputRef}
            type="text"
            name="name"
            className={cn(
              'font-sans text-sm text-basic-400',
              'w-full rounded-md px-3 py-2 border border-solid border-basic-200'
            )}
            value={milestone.name}
            onChange={handleChange}
          />
          <div className="flex flex-row gap-1 ml-auto">
            <button
              type="button"
              className={cn(
                'shrink-0 font-sans text-lg',
                'w-6 h-6 rounded-sm',
                'flex items-center justify-center',
                'bg-basic-200 text-basic-300 hover:bg-primary-base hover:text-white'
              )}
              onClick={onCancel}
            >
              <MdClose />
            </button>
            <button
              type="button"
              className={cn(
                'shrink-0 font-sans text-lg',
                'w-6 h-6 rounded-sm',
                'flex items-center justify-center',
                'bg-basic-200 text-basic-300 hover:bg-primary-base hover:text-white'
              )}
              onClick={() => onSubmit(milestone)}
            >
              <MdSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneForm;
