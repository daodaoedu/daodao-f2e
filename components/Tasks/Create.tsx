import { useState } from 'react';
import { MdClose, MdSend, MdCalendarToday, MdKeyboardArrowDown } from 'react-icons/md';
import { useMilestones } from '@/contexts/Milestones/index';
import { cn } from "@/utils/cn";
import toast from 'react-hot-toast';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const dayMap: { [key: string]: string } = {
  Monday: '週一',
  Tuesday: '週二',
  Wednesday: '週三',
  Thursday: '週四',
  Friday: '週五',
  Saturday: '週六',
  Sunday: '週日'
};

interface CreateProps {
  index: number;
  projectId: string;
  milestoneId: number;
  onCancel: () => void;
  onRefreshData?: () => void;
}

interface TaskType {
  name: string,
  description: string,
  daysOfWeek: string[],
  isCompleted: boolean,
}

const TaskCreate = ({
  index,
  projectId,
  milestoneId,
  onCancel,
  onRefreshData,
}: CreateProps) => {
  const [newTask, setNewTask] = useState<TaskType>({
    name: "",
    description: "",
    daysOfWeek: [],
    isCompleted: false,
  });
  const { createTask, fetchMilestones } = useMilestones();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTask((prev) => ({ ...prev, name: e.target.value }));
  };

  // const handleChangeWeekdays = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const options = [...e.target.selectedOptions];
  //   const values = options.map((opt) => opt.value);
  //   setNewMilestone((prev) => ({ ...prev, dates: values }));
  // };

  const handleSubmit = async () => {
    const success = await createTask(projectId, milestoneId, newTask);
    if (success) {
      toast.success('任務新增成功');
      fetchMilestones(projectId);
      onCancel();
      onRefreshData?.();
    } else {
      toast.error('任務新增失敗，請稍後再試');
    }
  };

  const handleDaySelect = (day: string) => {
    setNewTask((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  return (
    <div className="ml-5 p-[10px] md:py-3 md:px-4 rounded-lg bg-white">
      <div className="flex flex-row items-center justify-between">
        <div className="w-full flex flex-col md:flex-row items-center  md:justify-between gap-1">
          <div className="w-full flex justify-between">
            <span className="text-sm text-text-primary w-5 text-center shrink-0">
              {`${index + 1}.`}
            </span>
            <input
              type="text"
              placeholder="任務名稱"
              onChange={handleChangeName}
              value={newTask.name}
              className={cn(
                "font-sans text-sm text-basic-400",
                "w-full rounded-md px-3 py-2 border border-solid border-basic-200"
              )}
            />
          </div>
          <div className="relative w-full mt-2 md:mt-0 md:ml-2 md:w-auto">
            <div
              role="button"
              tabIndex={0}
              className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setIsDropdownOpen(!isDropdownOpen);
                }
              }}
            >
              <MdCalendarToday className="w-4 h-4 text-[#92989A]" />
              <div className="relative w-[150px]">
                <div className="flex items-center justify-between">
                  <span className="truncate">
                    {newTask.daysOfWeek.length > 0
                      ? newTask.daysOfWeek
                        .map((enDay) => dayMap[enDay])
                        .join('、')
                      : '選擇日期'}
                  </span>
                  <MdKeyboardArrowDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                    {WEEKDAYS.map((day) => (
                      <div
                        role="option"
                        tabIndex={0}
                        key={day}
                        aria-selected={newTask.daysOfWeek.includes(day)}
                        onClick={() => handleDaySelect(day)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleDaySelect(day);
                          }
                        }}
                        className={`p-2 mb-1 mx-1 rounded cursor-pointer ${newTask.daysOfWeek.includes(day)
                          ? 'bg-selected-bg text-text-primary'
                          : 'bg-transparent hover:bg-gray-100'
                          }`}
                      >
                        {dayMap[day]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-1 ml-auto">
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                "shrink-0 font-sans text-lg",
                "w-6 h-6 rounded-sm",
                "flex items-center justify-center",
                "bg-basic-200 text-basic-300 hover:bg-primary-base hover:text-white"
              )}
            >
              <MdClose />
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={cn(
                "shrink-0 font-sans text-lg",
                "w-6 h-6 rounded-sm",
                "flex items-center justify-center",
                "bg-basic-200 text-basic-300 hover:bg-primary-base hover:text-white"
              )}
            >
              <MdSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCreate;
