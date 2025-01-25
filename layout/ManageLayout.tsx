import { usePathname } from 'next/navigation';
import Sidebar from '@/shared/components/Sidebar';
import Collapse from '@/shared/components/Collapse';
import DefaultLayout from './DefaultLayout';

export default function ManageLayout({ children }: React.PropsWithChildren) {
  const pathname = usePathname();

  return (
    <DefaultLayout>
      <div className="bg-primary-palest">
        <div className="flex p-4 pt-5 pb-12 lg:pt-12 gap-10 max-w-6xl mx-auto min-h-screen-with-padding-top">
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
              <Sidebar.Link
                href="/manage/classroom"
                isActive={pathname === '/manage/classroom'}
                isDisabled
              >
                我的教室
              </Sidebar.Link>
            </Sidebar>
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </DefaultLayout>
  );
}
