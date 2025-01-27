import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AiOutlineEye, AiOutlineMore } from 'react-icons/ai';
import { MdLockOpen } from "react-icons/md";
import { GoBookmark } from "react-icons/go";

import { ProtectedComponent } from '@/contexts/Auth';
import Button from '@/shared/components/Button';
import Container from '@/shared/components/Container';
import Image from '@/shared/components/Image';
import Sidebar from '@/shared/components/Sidebar';
import DefaultLayout from './DefaultLayout';

export default function ProjectLayout({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('id');

  return (
    <DefaultLayout>
      <ProtectedComponent redirectOnCancel="/">
        <div className="bg-primary-palest">
          <Container
            className="pt-2 px-4 pb-12 max-w-6xl mx-auto"
            autoMinHeight
          >
            <div className="flex flex-wrap gap-x-10">
              <div className="basis-full">
                <Button
                  size="sm"
                  className="px-0 mb-6 lg:mb-3"
                  prefixIcon="FaAngleLeft"
                  onClick={() => router.push('/manage/projects')}
                >
                  返回 學習計畫
                </Button>
              </div>
              <Sidebar className="mb-6 lg:mb-0 basis-full -order-1 lg:order-none lg:basis-80">
                <Sidebar.Link
                  href={
                    projectId
                      ? `/manage/project?id=${projectId}`
                      : '/manage/projects'
                  }
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
                >
                  學習成果
                </Sidebar.Link>
                <Sidebar.Link
                  href="/manage/project/notes"
                  isActive={pathname === '/manage/project/notes'}
                >
                  便利貼
                </Sidebar.Link>
                <Sidebar.Link
                  href="/manage/project/review"
                  isActive={pathname === '/manage/project/review'}
                >
                  覆盤
                </Sidebar.Link>
              </Sidebar>
              <div className="flex-1">
                <header className="mb-6">
                  <div className="mb-3 flex flex-col lg:flex-row justify-between lg:items-center gap-y-3">
                    <h1 className="heading-md text-basic-500">
                      學習計畫主題名稱
                    </h1>
                    <div className="flex items-center justify-between lg:justify-end gap-2 text-basic-300">
                      <time>2025/01/26</time>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          <AiOutlineEye />
                          <span>9999</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <MdLockOpen />
                          <span>公開</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <GoBookmark />
                          <span>2</span>
                        </div>
                        <Button className="p-0">
                          <AiOutlineMore />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 body-sm">
                    <div className="rounded-full overflow-hidden *:!block">
                      <Image src="" alt="" width="40px" height="40px" />
                    </div>
                    <div className="text-basic-400">用戶Ａ</div>
                    <div className="px-2.5 py-0.5 text-basic-500 bg-basic-100 rounded">
                      學生
                    </div>
                    <div className="px-2.5 py-0.5 text-basic-white bg-primary-lighter rounded">
                      馬拉松入選
                    </div>
                  </div>
                </header>
                {children}
              </div>
            </div>
          </Container>
        </div>
      </ProtectedComponent>
    </DefaultLayout>
  );
}
