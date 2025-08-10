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
    <div className="flex flex-row gap-2 items-center">
      <img
        src={user.photoURL}
        alt={user.name}
        className="rounded-full w-[30px] h-[30px]"
      />
      <span className="font-sans text-sm font-medium text-basic-400">
        {user.name}
      </span>
      {zhRole && (
        <div className="
          py-[3px] px-[10px] bg-basic-100 rounded-[4px]
          font-sans text-sm text-basic-500 leading-[1.4]
          "
        >
          {zhRole}
        </div>
      )}
    </div>
  );
};
export default ProjectUserInfoBar;
