import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/shared/components/Sidebar';
import Collapse from '@/shared/components/Collapse';
import Container from '@/shared/components/Container';
import { ProtectedComponent, useAuth } from '@/contexts/Auth';
import { getManageSidebarItems } from '@/constants/sidebar';
import getDefaultLayout from './DefaultLayout';

function ManageLayout({ children }: React.PropsWithChildren) {
  const { user } = useAuth();
  const pathname = usePathname();

  const sidebarItems = useMemo(
    () => getManageSidebarItems({ role: user?.role }),
    [user?.role]
  );

  return (
    <ProtectedComponent redirectOnCancel="/">
      <div className="bg-primary-palest">
        <Container
          className="flex px-4 pb-12 gap-10 max-w-6xl mx-auto"
          autoMinHeight
        >
          <div className="basis-80 hidden lg:block">
            <Sidebar>
              {sidebarItems.map((item) =>
                item.children ? (
                  <Collapse>
                    <Sidebar.Item>
                      <Collapse.Toggle className="w-full px-10 py-2" withIcon>
                        {item.label}
                      </Collapse.Toggle>
                    </Sidebar.Item>
                    <Collapse.List className="*:my-2 *:aria-hidden:my-0">
                      {item.children.map(
                        (child) =>
                          child.href && (
                            <Collapse.Item key={child.href}>
                              <Sidebar.Link
                                className="pl-14"
                                href={child.href}
                                isActive={pathname === child.href}
                              >
                                {child.label}
                              </Sidebar.Link>
                            </Collapse.Item>
                          )
                      )}
                    </Collapse.List>
                  </Collapse>
                ) : (
                  <Sidebar.Link
                    key={item.href}
                    href={item.href}
                    isActive={pathname === item.href}
                  >
                    {item.label}
                  </Sidebar.Link>
                )
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
