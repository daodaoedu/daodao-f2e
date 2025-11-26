import { ROLE } from '@/constants/member';

interface UserInfoBarProps {
  user: {
    name: string,
    photoURL: string,
    roleList: string[]
  }
}
const ProjectUserInfoBar = ({ user }: UserInfoBarProps) => {
  const zhRole = ROLE.find((r) => r.value === user.roleList[0])?.label;

  return (
    <div className="flex flex-row items-center gap-2">
      <img
        src={user.photoURL}
        alt={user.name}
        className="size-[30px] rounded-full"
      />
      <span className="font-sans text-sm font-medium text-basic-400">
        {user.name}
      </span>
      {zhRole && (
        <div className="
          rounded-[4px] bg-basic-100 px-[10px] py-[3px]
          font-sans text-sm leading-[1.4] text-basic-500
          "
        >
          {zhRole}
        </div>
      )}
    </div>
  );
};
export default ProjectUserInfoBar;
