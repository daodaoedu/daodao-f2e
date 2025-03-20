import { RoleEnum } from '@/contexts/Auth';

interface GetManageSidebarItemsOptions {
  role?: RoleEnum;
}

type SidebarItem =
  | {
      label: string;
      href: string;
      isDisabled?: boolean;
      children?: never;
    }
  | {
      label: string;
      href?: never;
      isDisabled?: boolean;
      children: SidebarItem[];
    };

export const getManageSidebarItems = ({
  role,
}: GetManageSidebarItemsOptions): SidebarItem[] => {
  const permissions = [RoleEnum.Mentor, RoleEnum.Admin, RoleEnum.SuperAdmin];
  const canVisitMentorWorkspace = role ? permissions.includes(role) : false;

  const items: SidebarItem[] = [
    {
      label: '我的小島',
      href: '/manage',
    },
    {
      label: '我的學習計畫',
      href: '/manage/projects',
    },
    {
      label: '個人檔案',
      href: '/personal-card/my-card',
    },
    {
      label: '個人名片',
      href: '/manage/business-card',
    },
    {
      label: '百寶箱',
      children: [
        {
          label: '我的收藏',
          href: '/manage/treasure/collections',
          isDisabled: true,
        },
        {
          label: '我的足跡',
          href: '/manage/treasure/footprints',
          isDisabled: true,
        },
        {
          label: '追蹤的夥伴',
          href: '/manage/treasure/following',
          isDisabled: true,
        },
      ],
    },
    {
      label: '人脈資源庫',
      href: '/manage/people-resources',
    },
    {
      label: '學習資源庫',
      href: '/manage/learning-resources',
    },
    {
      label: 'AI引導師',
      href: '/manage/ai-dialogue',
    },
  ];

  if (canVisitMentorWorkspace) {
    items.push({
      label: '導師工作室',
      href: '/manage/mentor-workspace',
      isDisabled: role !== RoleEnum.Mentor,
    });
  }

  return items;
};
