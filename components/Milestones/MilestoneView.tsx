import { FaArrowRight } from "react-icons/fa";
import dayjs from "dayjs";
import { cn } from "@/utils/cn";
import { Milestone } from "@/contexts/Milestones/type";

interface MilestoneViewProps {
  index: number;
  milestone: Milestone;
}

const MilestoneView = ({ index, milestone }: MilestoneViewProps) => {
  return (
    <div className="p-[10px] md:py-3 md:px-4 rounded-lg bg-white">
      <div className="flex flex-row items-center justify-beetween mb-[10px]">
        <div className="bg-primary-base text-white py-[5px] px-5 rounded-[20px] font-sans text-sm leading-[140%]">
          里程碑 {index + 1}
        </div>
        <div
          className="
          ml-auto
          flex flex-row items-center gap-[3px]
          font-sans text-sm text-basic-300"
        >
          <p>
            {milestone.startDate
              ? dayjs(milestone.startDate).format("YYYY/MM/DD")
              : dayjs().format("YYYY/MM/DD")}
          </p>
          <FaArrowRight className="text-basic-300" />
          <p>
            {milestone.endDate
              ? dayjs(milestone.endDate).format("YYYY/MM/DD")
              : dayjs().format("YYYY/MM/DD")}
          </p>
        </div>
      </div>
      <div className="flex flex-row items-center justify-between">
        <div className="w-full flex flex-col md:flex-row items-center  md:justify-between gap-1">
          <p
            className={cn(
              "font-sans text-sm text-basic-400",
              "w-full rounded-md px-3 py-2 border border-solid border-basic-200"
            )}
          >
            {milestone.name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MilestoneView;
