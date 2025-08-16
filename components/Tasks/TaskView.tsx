import { Check, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Task as TaskType } from '@/contexts/Milestones/type';

interface TaskViewProps {
  task: TaskType;
}

// 加入 dayMap 用於本地化轉換
const dayMap: { [key: string]: string } = {
  Monday: '週一',
  Tuesday: '週二',
  Wednesday: '週三',
  Thursday: '週四',
  Friday: '週五',
  Saturday: '週六',
  Sunday: '週日',
};

const TaskView = ({
  task,
}: TaskViewProps) => (
  <div className="ml-5 rounded-lg bg-white p-[10px] md:px-4 md:py-3">
    <div className="flex flex-row items-center justify-between">
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-row justify-start gap-1">
          <div
            className="
              flex w-full basis-0 flex-row items-center justify-center gap-[5px]"
          >
            <p className={cn(
              'w-[18px] h-[18px] p-[2px] rounded-[4px] m-[1px]',
              'flex items-center justify-center',
              'border-2 border-solid',
              task.isCompleted
                ? 'bg-primary-base text-white border-primary-base'
                : 'bg-white text-basic-400 border-basic-400'
            )}
            >
              {task.isCompleted && <Check />}
            </p>
          </div>
          <p className="w-full">{task.name || ''}</p>
        </div>
        {task.daysOfWeek?.length > 0 && (
        <div className="text-text-secondary ml-7 mt-1 flex items-center gap-1 text-sm">
          <Calendar className="size-4 shrink-0 text-[#92989A]" />
          <span>
            {task.daysOfWeek
              ?.map((enDay) => dayMap[enDay])
              ?.join('、') ?? ''}
          </span>
        </div>
        )}
      </div>
    </div>
  </div>
);

export default TaskView;
