import { useState } from 'react';
import { FaCheck } from "react-icons/fa6";
import { cn } from "@/utils/cn";
import { useMilestones } from '@/contexts/Milestones/index';
import { Task as TaskType } from "@/contexts/Milestones/type";

import toast from 'react-hot-toast';

import { MdSend, MdClose, MdEdit, MdDelete } from "react-icons/md";

interface TaskProps {
  projectId : string;
  milestoneId: number;
  task: TaskType;
}
const Task = ({
  projectId,
  milestoneId,
  task,
}: TaskProps) => {
  const { dispatchTask, deleteTask } = useMilestones();
  const [isEditing, setIsEditing] = useState(false);
  const [newTask, setNewTask] = useState<TaskType>(task);
  const handleClickUpdate = async () => {
    const success = await dispatchTask(projectId, milestoneId, newTask);
    if (success) {
      toast.success('任務更新成功');
      setIsEditing(false);
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

  const handleCheckCompleted = async (event:
    React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = event.target;
    const success = await dispatchTask(projectId, milestoneId, {
      ...newTask,
      [name]: checked
    });

    if (success) {
      toast.success('任務更新成功');
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
    } else {
      toast.error('任務刪除失敗，請稍後再試');
    }
  };

  return (
    <div className="p-[10px] md:py-3 md:px-4 rounded-lg bg-white">
      <div className="flex flex-row items-center justify-between">
        {
          isEditing ? (
            <div className="w-full flex flex-col md:flex-row items-center  md:justify-between gap-1">
              <input
                type="text"
                name="name"
                id="name"
                className={cn(
                  "font-sans text-sm text-basic-400",
                  "w-full rounded-md px-3 py-2 border border-solid border-basic-200"
                )}
                value={newTask.name || ""}
                onChange={handleChangeInput}
              />
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
            <div className="flex flex-row w-full justify-start gap-1">
              <label
                htmlFor={`is_completed_${task.id}`}
                className="
                flex flex-row justify-center items-center gap-[5px] hover:cursor-pointer w-full basis-0"
              >
                <input
                  type="checkbox"
                  name="is_completed"
                  id={`is_completed_${task.id}`}
                  className="peer hidden"
                  checked={task.is_completed}
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
                  {task.is_completed && <FaCheck />}
                </p>
              </label>
              <p className="w-full">{task.name || ""}</p>
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
          )
        }
      </div>
    </div>
  );
};

export default Task;
