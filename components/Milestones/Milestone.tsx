import { useState } from 'react';
import { FaArrowRight } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import dayjs from "dayjs";
import { cn } from "@/utils/cn";
import { useProject } from "@/contexts/Project";
import { useMilestones } from "@/contexts/Milestones/index";

import toast from 'react-hot-toast';

import { MdSend, MdClose, MdEdit } from "react-icons/md";
import { Milestone as MilestoneType } from "../../contexts/Milestones/type";
import { numberToZh } from "./Shared";

interface MilestoneProps {
  milestone: MilestoneType;
  isLgScreen?: boolean;
}
const Milestone = ({
  milestone,
  isLgScreen = false,
}: MilestoneProps) => {
  const { project } = useProject();
  const { dispatchMilestone } = useMilestones();
  const [isEditing, setIsEditing] = useState(false);
  const [newMilestone, setNewMilestone] = useState<MilestoneType>(milestone);
  const handleClickUpdate = async () => {
    const success = await dispatchMilestone(project.id, newMilestone);
    if (success) {
      toast.success('里程碑更新成功');
      setIsEditing(false);
    } else {
      toast.error('里程碑更新失敗，請稍後再試');
    }
  };

  const handleChangeInput = (event:
    React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setNewMilestone({
      ...newMilestone,
      [name]: value,
    });
  };

  const handleClickCancel = () => {
    // TODO: add popup to let user confirm discard editing message
    setNewMilestone(milestone);
    setIsEditing(false);
  };

  const handleCheckCompleted = async (event:
    React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = event.target;
    const success = await dispatchMilestone(project.id, {
      ...newMilestone,
      [name]: checked
    });

    if (success) {
      toast.success('里程碑更新成功');
    } else {
      toast.error('里程碑更新失敗，請稍後再試');
    }
  };

  const handleClickEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="p-[10px] md:py-3 md:px-4 rounded-lg bg-white">
      <div className="flex flex-row items-center justify-beetween mb-[10px]">
        <div className="bg-primary-base text-white py-[5px] px-5 rounded-[20px] font-sans text-sm leading-[140%]">
          第{numberToZh(milestone.week)}週
        </div>
        {isLgScreen && (
          <div className="md:ml-3 font-sans text-sm text-basic-300">
            {/* <span>50%</span> */}
          </div>
        )}
        <div className="
          ml-auto
          flex flex-row items-center gap-[3px]
          font-sans text-sm text-basic-300"
        >
          <p>{milestone.startDate ? dayjs(milestone.startDate).format('YYYY/MM/DD') : dayjs().format('YYYY/MM/DD')}</p>
          <FaArrowRight className="text-basic-300" />
          <p>{milestone.endDate ? dayjs(milestone.endDate).format('YYYY/MM/DD') : dayjs().format('YYYY/MM/DD')}</p>
        </div>
      </div>
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
                value={newMilestone.name}
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
                htmlFor={`isCompleted_${milestone.id}`}
                className="
                flex flex-row justify-center items-center gap-[5px] hover:cursor-pointer w-full basis-0"
              >
                <input
                  type="checkbox"
                  name="isCompleted"
                  id={`isCompleted_${milestone.id}`}
                  className="peer hidden"
                  checked={milestone.isCompleted}
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
                  {milestone.isCompleted && <FaCheck />}
                </p>
              </label>
              <p className="w-full">{milestone.name}</p>
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
          )
        }
      </div>
    </div>
  );
};

export default Milestone;
