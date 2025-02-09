import { useState } from 'react';
import { MdClose, MdSend, MdCalendarToday, MdKeyboardArrowDown } from 'react-icons/md';
import { useMilestones } from '@/contexts/Milestones/index';

const dayMap: { [key: string]: string } = {
  週一: 'Monday',
  週二: 'Tuesday',
  週三: 'Wednesday',
  週四: 'Thursday',
  週五: 'Friday',
  週六: 'Saturday',
  週日: 'Sunday'
};

const ZH_WEEK_DAY_MAP = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];

function weekdayToISO(zhDay: string): string {
  return dayMap[zhDay];
}

interface CreateProps {
  index: number;
  projectId : string;
  milestoneId: number;
  onCancel: () => void;
}

interface TaskType {
  name: string,
  description: string,
  days_of_week: string[],
  is_completed: boolean,
}

const TaskCreate = ({
  index,
  projectId,
  milestoneId,
  onCancel
}: CreateProps) => {
  const [newTask, setNewTask] = useState<TaskType>({
    name: "",
    description: "",
    days_of_week: [],
    is_completed: false,
  });
  const { createTask } = useMilestones();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTask((prev) => ({ ...prev, name: e.target.value }));
  };

  // const handleChangeWeekdays = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const options = [...e.target.selectedOptions];
  //   const values = options.map((opt) => opt.value);
  //   setNewMilestone((prev) => ({ ...prev, dates: values }));
  // };

  const handleSubmit = () => {
    createTask(projectId, milestoneId, newTask);
    onCancel();
  };

  const handleDaySelect = (day: string) => {
    setNewTask((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  return (
    <div className="flex items-center justify-start gap-2.5 w-full p-3 rounded-lg border border-gray-custom bg-white focus-within:border-primary focus-within:p-3 max-md:grid max-md:grid-areas-[content_buttons;date_date] max-md:grid-cols-[1fr_auto]">
      <div className="flex-grow flex items-center gap-2.5 grid-area-[content]">
        <span className="text-sm text-text-primary w-5 text-center shrink-0">
          {`${index + 1}.`}
        </span>
        <input
          type="text"
          placeholder="任務名稱"
          onChange={handleChangeName}
          value={newTask.name}
          className="w-full p-0 text-sm border-none focus:ring-0 placeholder:text-gray-400"
        />
      </div>

      <div className="grid-area-[date] relative">
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
                {newTask.days_of_week.length > 0
                  ? newTask.days_of_week
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    .map((isoDay) => Object.entries(dayMap).find(([_zhDay, iso]) => iso === isoDay)?.[0])
                    .join('、')
                  : '選擇日期'}
              </span>
              <MdKeyboardArrowDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                {ZH_WEEK_DAY_MAP.map((zhDay) => (
                  <div
                    role="option"
                    tabIndex={0}
                    key={zhDay}
                    aria-selected={newTask.days_of_week.includes(weekdayToISO(zhDay))}
                    onClick={() => handleDaySelect(weekdayToISO(zhDay))}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleDaySelect(weekdayToISO(zhDay));
                    }
                  }}
                    className={`p-2 mb-1 mx-1 rounded cursor-pointer ${
                    newTask.days_of_week.includes(weekdayToISO(zhDay))
                      ? 'bg-selected-bg text-text-primary'
                      : 'bg-transparent hover:bg-gray-100'
                  }`}
                  >
                    {zhDay}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 grid-area-[buttons]">
        <button
          type="button"
          onClick={onCancel}
          className="w-6 h-6 bg-gray-custom hover:bg-secondary opacity-50 rounded flex items-center justify-center transition-colors"
        >
          <MdClose className="w-4.5 h-4.5" />
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="w-6 h-6 bg-gray-custom hover:bg-secondary opacity-50 rounded flex items-center justify-center transition-colors"
        >
          <MdSend className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
};

export default TaskCreate;
