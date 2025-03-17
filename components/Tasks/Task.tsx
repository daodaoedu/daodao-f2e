import React, { useState } from 'react';
import { FaCheck } from "react-icons/fa6";
import { cn } from "@/utils/cn";
import { useMilestones } from '@/contexts/Milestones/index';
import { Task as TaskType } from "@/contexts/Milestones/type";

import toast from 'react-hot-toast';

import { MdSend, MdClose, MdEdit, MdDelete, MdCalendarToday, MdKeyboardArrowDown } from "react-icons/md";

interface TaskProps {
  projectId : string;
  milestoneId: number;
  task: TaskType;
  onRefreshData?: () => void;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// 加入 dayMap 用於本地化轉換
const dayMap: { [key: string]: string } = {
  Monday: '週一',
  Tuesday: '週二',
  Wednesday: '週三',
  Thursday: '週四',
  Friday: '週五',
  Saturday: '週六',
  Sunday: '週日'
};

const Task = ({
  projectId,
  milestoneId,
  task,
  onRefreshData,
}: TaskProps) => {
  const { dispatchTask, deleteTask, fetchMilestones } = useMilestones();
  const [isEditing, setIsEditing] = useState(false);
  const [newTask, setNewTask] = useState<TaskType>(task);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleClickUpdate = async () => {
    const success = await dispatchTask(projectId, milestoneId, newTask);
    if (success) {
      toast.success('任務更新成功');
      setIsEditing(false);
      fetchMilestones(projectId);
      onRefreshData?.();
    } else {
      toast.error('任務更新失敗，請稍後再試');
    }
  };

  const handleChangeInput = (event:
    React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setNewTask({
      ...newTask,
      [name]: value,
    });
  };

  const handleClickCancel = () => {
    // TODO: add popup to let user confirm discard editing message
    setNewTask(task);
    setIsEditing(false);
  };

  const handleCheckCompleted = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const success = await dispatchTask(projectId, milestoneId, {
      ...task,
      [name]: checked
    });

    if (success) {
      toast.success('任務更新成功');
      fetchMilestones(projectId);
      onRefreshData?.();
    } else {
      toast.error('任務更新失敗，請稍後再試');
    }
  };

  const handleClickEdit = () => {
    setIsEditing(true);
  };

  const handleClickDelete = async () => {
    const success = await deleteTask(projectId, milestoneId, task);
    if (success) {
      toast.success('任務刪除成功');
      fetchMilestones(projectId);
      onRefreshData?.();
    } else {
      toast.error('任務刪除失敗，請稍後再試');
    }
  };

  const handleDaySelect = (day: string) => {
    setNewTask((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek?.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...(prev.daysOfWeek || []), day]
    }));
  };

  return (
    <div className="ml-5 p-[10px] md:py-3 md:px-4 rounded-lg bg-white">
      <div className="flex flex-row items-center justify-between">
        {
          isEditing ? (
            <div className="flex-1 flex flex-col md:flex-row items-center  md:justify-between gap-1">
              <input
                type="text"
                name="name"
                id="name"
                className={cn(
                  "-m-px font-sans text-sm text-basic-400",
                  "w-full rounded-md pl-6 py-2 border border-solid border-basic-200"
                )}
                value={newTask.name || ""}
                onChange={handleChangeInput}
              />
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
                        {newTask.daysOfWeek?.length > 0
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
                            aria-selected={newTask.daysOfWeek?.includes(day)}
                            onClick={() => handleDaySelect(day)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleDaySelect(day);
                              }
                            }}
                            className={`p-2 mb-1 mx-1 rounded cursor-pointer ${
                              newTask.daysOfWeek?.includes(day)
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
                  className={cn(
                    "shrink-0 font-sans text-lg",
                    "w-6 h-6 rounded-sm",
                    "flex items-center justify-center",
                    "bg-basic-200 text-basic-300 hover:bg-primary-base hover:text-white"
                  )}
                  onClick={handleClickCancel}
                >
                  <MdClose />
                </button>
                <button
                  type="button"
                  className={cn(
                    "shrink-0 font-sans text-lg",
                    "w-6 h-6 rounded-sm",
                    "flex items-center justify-center",
                    "bg-basic-200 text-basic-300 hover:bg-primary-base hover:text-white"
                  )}
                  onClick={handleClickUpdate}
                >
                  <MdSend />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="w-full flex items-center gap-1 overflow-hidden">
                <label
                  htmlFor={`isCompleted_${task.id}`}
                  className="
                  flex flex-row justify-center items-center gap-[5px] hover:cursor-pointer w-full basis-0"
                >
                  <input
                    type="checkbox"
                    name="isCompleted"
                    id={`isCompleted_${task.id}`}
                    className="peer hidden"
                    checked={task.isCompleted}
                    onChange={handleCheckCompleted}
                  />
                  <p className="
                  w-[18px] h-[18px] p-[2px] rounded-[4px] m-[1px]
                  flex items-center justify-center
                  bg-white text-basic-400 border-2 border-solid border-basic-400
                  peer-checked:bg-primary-base
                  peer-checked:text-white
                    peer-checked:border-primary-base
                  "
                  >
                    {task.isCompleted && <FaCheck />}
                  </p>
                </label>
                <p className="font-sans flex-1 py-2 body-sm text-basic-400 truncate">{task.name || ""}</p>
                <div className="flex flex-row gap-1 ml-auto">
                  <button
                    type="button"
                    className={cn(
                      "shrink-0 font-sans text-lg",
                      "w-6 h-6 rounded-sm",
                      "flex items-center justify-center",
                      "bg-basic-200 text-basic-300 hover:bg-primary-base hover:text-white"
                    )}
                    onClick={handleClickDelete}
                  >
                    <MdDelete />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "shrink-0 font-sans text-lg",
                      "w-6 h-6 rounded-sm",
                      "flex items-center justify-center",
                      "bg-basic-200 text-basic-300 hover:bg-primary-base hover:text-white"
                    )}
                    onClick={handleClickEdit}
                  >
                    <MdEdit />
                  </button>
                </div>
              </div>
              {task.daysOfWeek?.length > 0 && (
                <div className="flex items-center gap-1 mt-1 ml-7 text-sm text-text-secondary">
                  <MdCalendarToday className="w-4 h-4 text-[#92989A] shrink-0" />
                  <span>
                    {task.daysOfWeek
                      ?.map((enDay) => dayMap[enDay])
                      ?.join('、') ?? ''}
                  </span>
                </div>
              )}
            </div>
          )
        }
      </div>
    </div>
  );
};

export default Task;
