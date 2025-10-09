'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useMemo, useEffect, useRef } from 'react';
import { ProjectProvider } from '@/contexts/Project';
import Sidebar, { SidebarItemType } from '@/layout/components/Sidebar';
import { useProject } from '@/services/projects';
import NotExist from '@/shared/components/NotExist';
import ProjectHeader from '@/layout/components/ProjectHeader';
import { parseToString } from '@/utils/helper';
import Header from '@/layout/components/Header';
import Footer from '@/layout/components/Footer';
import { usePromotion } from '@/contexts/Promotion';

const projectRoutes = {
  detail: '/detail',
  milestones: '/milestones',
  outcomes: '/outcomes',
  notes: '/notes',
};

interface ProjectLayoutProps {
  children: React.ReactNode;
}

export default function ProjectDetailLayout({ children }: ProjectLayoutProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const projectId = parseToString(searchParams?.get('id'));

  const { data: project, isLoading } = useProject(projectId);
  const { isShowPromotionBar, height, setHeight } = usePromotion();
  const headerRef = useRef<HTMLDivElement>(null);
  const prevShowPromotionBar = useRef<boolean | null>(null);

  useEffect(() => {
    const handleScrollPaddingTop = () => {
      requestAnimationFrame(() => {
        if (!headerRef.current) return;
        const headerOffset = headerRef.current.offsetHeight;
        const root = document.querySelector(':root');

        setHeight(Math.floor(headerOffset));
        if (root instanceof HTMLElement) {
          root.style.setProperty('scroll-padding-top', `${headerOffset + 80}px`);
        }
      });
    };

    // Initial calculation
    handleScrollPaddingTop();

    if (prevShowPromotionBar.current !== isShowPromotionBar) {
      handleScrollPaddingTop();
      prevShowPromotionBar.current = isShowPromotionBar;
    }

    window.addEventListener('resize', handleScrollPaddingTop);
    return () => {
      window.removeEventListener('resize', handleScrollPaddingTop);
    };
  }, [isShowPromotionBar, setHeight]);

  const sidebarItems: SidebarItemType[] = useMemo(() => {
    const urlPrefix = '/projects';
    const query = projectId ? `?id=${projectId}` : '';

    return [
      {
        label: '學習計畫',
        href: `${urlPrefix}${projectRoutes.detail}${query}`,
        isActive: pathname?.startsWith(`${urlPrefix}${projectRoutes.detail}`) || false,
      },
      {
        label: '學習里程碑',
        href: `${urlPrefix}${projectRoutes.milestones}${query}`,
        isActive: pathname?.startsWith(`${urlPrefix}${projectRoutes.milestones}`) || false,
      },
      {
        label: '學習成果',
        href: `${urlPrefix}${projectRoutes.outcomes}${query}`,
        isActive: pathname?.startsWith(`${urlPrefix}${projectRoutes.outcomes}`) || false,
      },
      {
        label: '便利貼',
        href: `${urlPrefix}${projectRoutes.notes}${query}`,
        isActive: pathname?.startsWith(`${urlPrefix}${projectRoutes.notes}`) || false,
      },
    ];
  }, [projectId, pathname]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="bg-white" style={{ paddingTop: height }}>
          <div className="flex min-h-[400px] items-center justify-center">
            <div>Loading...</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Header />
        <main className="bg-white" style={{ paddingTop: height }}>
          <NotExist />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div ref={headerRef}>
        <Header />
      </div>
      <main style={{ paddingTop: height }}>
        <ProjectProvider>
          <Sidebar items={sidebarItems} backText="返回" showBackButton>
            <ProjectHeader project={project} />
            {children}
          </Sidebar>
        </ProjectProvider>
      </main>
      <Footer />
    </>
  );
}
