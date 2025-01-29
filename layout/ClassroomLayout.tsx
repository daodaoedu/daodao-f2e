import { usePathname, useRouter } from 'next/navigation';
import Button from '@/shared/components/Button';
import Container from '@/shared/components/Container';
import Sidebar from '@/shared/components/Sidebar';
import { ProtectedComponent } from '@/contexts/Auth';
import DefaultLayout from './DefaultLayout';

function ClassroomLayoutContent({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <ProtectedComponent redirectOnCancel="/">
      <div className="bg-primary-palest">
        <Container className="pt-2 px-4 pb-12 max-w-6xl mx-auto" autoMinHeight>
          <div className="flex flex-wrap gap-x-10">
            <div className="basis-full">
              <Button
                size="sm"
                className="px-0 mb-6 lg:mb-3"
                prefixIcon="FaAngleLeft"
                onClick={() => router.push('/manage/classrooms')}
              >
                返回 我的教室
              </Button>
            </div>
            <Sidebar className="mb-6 lg:mb-0 basis-full -order-1 lg:order-none lg:basis-80">
              <Sidebar.Link
                href="/manage/classrooms/reviews"
                isActive={pathname === '/manage/classrooms/reviews'}
              >
                復盤
              </Sidebar.Link>
              <Sidebar.Link
                href="/manage/classrooms/students"
                isActive={pathname === '/manage/classrooms/students'}
              >
                我的學生
              </Sidebar.Link>
            </Sidebar>
            <div className="flex-1">{children}</div>
          </div>
        </Container>
      </div>
    </ProtectedComponent>
  );
}

export default function ClassroomLayout(page: React.ReactElement) {
  return DefaultLayout(<ClassroomLayoutContent>{page}</ClassroomLayoutContent>);
}
