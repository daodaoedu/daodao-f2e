import { MdAdd } from "react-icons/md";

interface TaskProps {
    setIsEditing: (value: boolean) => void;
}
const TaskAdd = ({
    setIsEditing,
}: TaskProps) => {
  const handleClickAdd = () => {
    setIsEditing(true);
  };

  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={handleClickAdd}
        className={`
          flex items-center gap-2 px-2 py-1
          text-sm text-basic-400 hover:text-primary-500
          transition-colors duration-200
        `}
      >
        <MdAdd className="w-5 h-5" />
        <span>新增子任務</span>
      </button>
    </div>
  );
};

export default TaskAdd;
