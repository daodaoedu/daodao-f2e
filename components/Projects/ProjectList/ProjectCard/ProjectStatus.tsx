import ShellIcon from '@/public/assets/icons/shell.svg';
import { Bookmark, MessageSquareText } from "lucide-react";

enum StatusEnum {
 FAVORITES = 'favorites',
 SHELLS = 'shells',
 COMMENTS = 'comments',
}

interface ProjectCardStatus {
  status: {
    [key in StatusEnum]: number
  }
}
const ProjectStatus = ({ status }: ProjectCardStatus) => {
  const statusList = [
    {
      name: StatusEnum.FAVORITES,
      icon: <Bookmark />,
      value: status.favorites,
    },
    {
      name: StatusEnum.SHELLS,
      icon: <ShellIcon />,
      value: status.shells
    },
    {
      name: StatusEnum.COMMENTS,
      icon: <MessageSquareText />,
      value: status.comments
    }
  ];

  return (
    <div className="flex flex-row items-center gap-3">
      {
        statusList.map((stat) => {
          return (
            <div
              key={stat.name}
              className="flex flex-row justify-start items-center gap-[2px]"
            >
              <span className="text-basic-500">{stat.icon}</span>
              <span className="font-sans text-sm leading-normal text-basic-500">
                {stat.value}
              </span>
            </div>
          );
        })
      }
    </div>
  );
};

export default ProjectStatus;
