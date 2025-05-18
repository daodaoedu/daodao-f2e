import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@/shared/components/Button';
import Container from '@/shared/components/Container';
import SidebarWrapper from '@/layout/components/Sidebar/SidebarWrapper';
import Collapse from '@/shared/components/Collapse';
import { usePromotion } from '@/contexts/Promotion';
import { cn } from '@/utils/cn';
import SidebarItem from './SidebarItem';
import SidebarLink from './SidebarLink';
import { SidebarItemType } from './type';

export interface SidebarLayoutProps extends React.PropsWithChildren {
  /**
   * 側邊欄項目，支援函數
   */
  items: SidebarItemType[];
  /**
   * 是否顯示返回按鈕
   */
  showBackButton?: boolean;
  /**
   * 返回按鈕路徑
   */
  backPath?: string;
  /**
   * 返回按鈕文字
   */
  backText?: string;
}

export default function SidebarLayout({
  children,
  items,
  showBackButton = false,
  backPath = '/',
  backText = '返回',
}: SidebarLayoutProps) {
  const { height, setIsShowShadow } = usePromotion();
  const router = useRouter();
  const [hasSticky, setHasSticky] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const isSticky = window.scrollY > 0;
      setHasSticky(isSticky);
      setIsShowShadow(window.innerWidth > 1024 ? true : !isSticky);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-primary-palest">
      <Container className="pt-2 px-4 pb-12 max-w-6xl mx-auto" autoMinHeight>
        <div className="flex flex-wrap gap-x-10">
          {showBackButton && (
            <div className="basis-full">
              <Button
                size="sm"
                className="px-0 mb-6 lg:mb-3"
                prefixIcon="FaAngleLeft"
                onClick={() => router.push(backPath)}
              >
                {backText}
              </Button>
            </div>
          )}

          {Array.isArray(items) && items.length > 0 && (
            <SidebarWrapper
              className={cn(
                'sticky z-20 transition-transform',
                'top-[var(--sidebar-top)] mb-6 basis-full -order-1',
                'lg:top-[calc(var(--sidebar-top)+24px)] lg:mb-0 lg:basis-80 lg:order-none',
                hasSticky && 'max-lg:scale-110'
              )}
              style={{ '--sidebar-top': `${height}px` } as React.CSSProperties}
            >
              {items.map((item) =>
                item.children ? (
                  <Collapse key={item.label}>
                    <SidebarItem>
                      <Collapse.Toggle className="w-full px-10 py-2" withIcon>
                        {item.label}
                      </Collapse.Toggle>
                    </SidebarItem>
                    <Collapse.List className="*:my-2 *:aria-hidden:my-0">
                      {item.children.map(
                        (child) =>
                          child.href && (
                            <Collapse.Item key={child.href}>
                              <SidebarLink
                                className="pl-14"
                                href={child.href}
                                isActive={child.isActive}
                                isDisabled={child.isDisabled}
                              >
                                {child.label}
                              </SidebarLink>
                            </Collapse.Item>
                          )
                      )}
                    </Collapse.List>
                  </Collapse>
                ) : (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    isActive={item.isActive}
                    isDisabled={item.isDisabled}
                  >
                    {item.label}
                  </SidebarLink>
                )
              )}
            </SidebarWrapper>
          )}

          <div className="basis-full max-w-full lg:flex-1 lg:max-w-[min(760px,100%-360px)]">
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
}
