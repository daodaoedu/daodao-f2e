import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/shared/components/Sidebar';
import Collapse from '@/shared/components/Collapse';
import Container from '@/shared/components/Container';
import { ProtectedComponent, RoleEnum, useAuth } from '@/contexts/Auth';
import getDefaultLayout from './DefaultLayout';

function ManageLayout({ children }: React.PropsWithChildren) {
  const { user } = useAuth();
  const pathname = usePathname();

  const canVisitMentorWorkspace = useMemo(() => {
    const permissions = [RoleEnum.Mentor, RoleEnum.Admin, RoleEnum.SuperAdmin];
    return user ? permissions.includes(user.role) : false;
  }, [user]);

  return (
    <ProtectedComponent redirectOnCancel="/">
      <div className="bg-primary-palest">
        <Container
          className="flex px-4 pb-12 gap-10 max-w-6xl mx-auto"
          autoMinHeight
        >
          <div className="basis-80 hidden lg:block">
            <Sidebar>
              <Sidebar.Link href="/manage" isActive={pathname === '/manage'}>
                我的小島
              </Sidebar.Link>
              <Sidebar.Link
                href="/manage/projects"
                isActive={pathname === '/manage/projects'}
              >
                我的學習計畫
              </Sidebar.Link>
              <Sidebar.Link
                href="/personal-card/my-card"
                isActive={pathname === '/personal-card/my-card'}
              >
                個人名片
              </Sidebar.Link>
              <Collapse>
                <Sidebar.Item>
                  <Collapse.Toggle className="w-full px-10 py-2" withIcon>
                    百寶箱
                  </Collapse.Toggle>
                </Sidebar.Item>
                <Collapse.List className="*:my-2 *:aria-hidden:my-0">
                  <Collapse.Item>
                    <Sidebar.Link
                      className="pl-14"
                      href="/manage/treasure"
                      isDisabled
                    >
                      我的收藏
                    </Sidebar.Link>
                  </Collapse.Item>
                  <Collapse.Item>
                    <Sidebar.Link
                      className="pl-14"
                      href="/manage/treasure"
                      isDisabled
                    >
                      我的足跡
                    </Sidebar.Link>
                  </Collapse.Item>
                  <Collapse.Item>
                    <Sidebar.Link
                      className="pl-14"
                      href="/manage/treasure"
                      isDisabled
                    >
                      追蹤的夥伴
                    </Sidebar.Link>
                  </Collapse.Item>
                </Collapse.List>
              </Collapse>
              {canVisitMentorWorkspace && (
                <Sidebar.Link
                  href="/manage/mentor-workspace"
                  isActive={pathname === '/manage/mentor-workspace'}
                  isDisabled={user?.role !== RoleEnum.Mentor}
                >
                  導師工作室
                </Sidebar.Link>
              )}
            </Sidebar>
          </div>
          <div className="flex-1">{children}</div>
        </Container>
      </div>
    </ProtectedComponent>
  );
}

export default function getManageLayout(page: React.ReactElement) {
  return getDefaultLayout(<ManageLayout>{page}</ManageLayout>);
}
