import { usePathname, useSearchParams } from 'next/navigation';

import Sidebar from '@/shared/components/Sidebar';
import DefaultLayout from './DefaultLayout';

export default function ProjectLayout({ children }: React.PropsWithChildren) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');
  return (
    <DefaultLayout>
      <div className="bg-primary-palest">
        <div className="flex p-4 py-5 md:py-12 gap-10 max-w-6xl mx-auto min-h-screen-with-padding-top flex-col md:flex-row">
          <div className="md:basis-80">
            <Sidebar>
              <Sidebar.Link
                href={projectId ? `/manage/project?id=${projectId}` : '/manage/projects'}
                isActive={pathname === '/manage/project'}
              >
                學習計畫
              </Sidebar.Link>
              <Sidebar.Link
                href="/manage/project/milestones"
                isActive={pathname === '/manage/project/milestones'}
              >
                學習里程碑
              </Sidebar.Link>
              <Sidebar.Link
                href="/manage/project/outcomes"
                isActive={pathname === '/manage/project/outcomes'}
                isDisabled
              >
                學習成果
              </Sidebar.Link>
              <Sidebar.Link
                href="/manage/project/notes"
                isActive={pathname === '/manage/project/notes'}
                isDisabled
              >
                便利貼
              </Sidebar.Link>
              <Sidebar.Link
                href="/manage/project/review"
                isActive={pathname === '/manage/project/review'}
                isDisabled
              >
                覆盤
              </Sidebar.Link>
            </Sidebar>
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </DefaultLayout>
  );
}
