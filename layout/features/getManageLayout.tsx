import { usePathname } from 'next/navigation';
import Sidebar, { SidebarItemType } from '@/layout/components/Sidebar';
import { RoleEnum } from '@/services/users';
import { useSession } from '@/entities/session';
import { ProjectProvider } from '@/contexts/Project';
import { MilestonesProvider } from '@/contexts/Milestones';
import getPrivateLayout from '../core/getPrivateLayout';

const MENTOR_WORKSPACE_PERMISSIONS = [
  RoleEnum.Mentor,
  RoleEnum.Admin,
  RoleEnum.SuperAdmin,
];

const getCanVisitMentorWorkspace = (role?: RoleEnum | null) => (role ? MENTOR_WORKSPACE_PERMISSIONS.includes(role) : false);

const manageRoutes = {
  manage: '/manage',
  projects: '/manage/projects',
  myCard: '/personal-card/my-card',
  collections: '/manage/treasure/collections',
  footprints: '/manage/treasure/footprints',
  following: '/manage/treasure/following',
  mentorWorkspace: '/manage/mentor-workspace',
};

interface GetManageSidebarItemsOptions {
  pathname: string;
  role?: RoleEnum | null;
}

export const getManageSidebarItems = ({
  pathname,
  role,
}: GetManageSidebarItemsOptions) => {
  const genSidebarItem = (label: string, href: string, isDisabled = false) => ({
    label,
    href,
    isDisabled,
    isActive: pathname === href,
  });

  const items: SidebarItemType[] = [
    genSidebarItem('我的小島', manageRoutes.manage),
    genSidebarItem('我的學習計畫', manageRoutes.projects),
    genSidebarItem('個人名片', manageRoutes.myCard),
    {
      label: '百寶箱',
      children: [
        genSidebarItem('我的收藏', manageRoutes.collections, true),
        genSidebarItem('我的足跡', manageRoutes.footprints, true),
        genSidebarItem('追蹤的夥伴', manageRoutes.following, true),
      ],
    },
  ];

  if (getCanVisitMentorWorkspace(role)) {
    items.push(genSidebarItem('導師工作室', manageRoutes.mentorWorkspace));
  }

  return items;
};

function ManageLayout({ children }: React.PropsWithChildren) {
  const pathname = usePathname();
  const { user } = useSession();
  const role = user?.role;
  const canVisitMentorWorkspace = getCanVisitMentorWorkspace(role);
  const sidebarItems = getManageSidebarItems({
    pathname: pathname || '',
    role,
  });

  if (!canVisitMentorWorkspace && pathname === manageRoutes.mentorWorkspace) {
    return <div>No access</div>;
  }

  return <Sidebar items={sidebarItems}>{children}</Sidebar>;
}

export default function getManageLayout(page: React.ReactElement) {
  return getPrivateLayout(
    <ProjectProvider>
      <MilestonesProvider>
        <ManageLayout>{page}</ManageLayout>
      </MilestonesProvider>
    </ProjectProvider>
  );
}
