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
  <div className="ml-5 p-[10px] md:py-3 md:px-4 rounded-lg bg-white">
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-col w-full">
        <div className="flex flex-row w-full justify-start gap-1">
          <div
            className="
              flex flex-row justify-center items-center gap-[5px] w-full basis-0"
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
        <div className="flex items-center gap-1 mt-1 ml-7 text-sm text-text-secondary">
          <Calendar className="w-4 h-4 text-[#92989A] shrink-0" />
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
