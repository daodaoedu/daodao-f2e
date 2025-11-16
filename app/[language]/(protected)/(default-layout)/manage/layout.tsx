'use client';

import { usePathname } from 'next/navigation';
import { ProjectProvider } from '@/contexts/Project';
import { MilestonesProvider } from '@/contexts/Milestones';
import Sidebar from '@/layout/components/Sidebar';
import { RoleEnum } from '@/services/users';
import { useAuth } from '@/entities/user';
import { getManageSidebarItems } from '@/layout/features/getManageLayout';

const manageRoutes = {
  mentorWorkspace: '/manage/mentor-workspace',
};

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role;
  const canVisitMentorWorkspace = role
    ? [RoleEnum.Mentor, RoleEnum.Admin, RoleEnum.SuperAdmin].includes(role)
    : false;

  const sidebarItems = getManageSidebarItems({
    pathname: pathname || '',
    role,
  });

  if (!canVisitMentorWorkspace && pathname === manageRoutes.mentorWorkspace) {
    return <div>No access</div>;
  }

  return (
    <ProjectProvider>
      <MilestonesProvider>
        <Sidebar items={sidebarItems}>{children}</Sidebar>
      </MilestonesProvider>
    </ProjectProvider>
  );
}
