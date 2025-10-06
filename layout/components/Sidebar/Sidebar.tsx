import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import Container from '@/shared/components/Container';
import SidebarWrapper from '@/layout/components/Sidebar/SidebarWrapper';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/accordion';
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
      <Container className="mx-auto max-w-6xl px-4 pb-12 pt-2" autoMinHeight>
        <div className="flex flex-wrap gap-x-10">
          {showBackButton && (
            <div className="basis-full">
              <Button
                size="sm"
                className="mb-6 px-0 lg:mb-3"
                variant="ghost"
                onClick={() => router.push(backPath)}
              >
                <ChevronLeft />
                {backText}
              </Button>
            </div>
          )}

          {Array.isArray(items) && items.length > 0 && (
            <Accordion type="single" collapsible asChild>
              <SidebarWrapper
                className={cn(
                  'sticky z-20 transition-transform',
                  'top-[var(--sidebar-top)] mb-6 basis-full -order-1',
                  'lg:top-[calc(var(--sidebar-top)+24px)] lg:mb-0 lg:basis-80 lg:order-none',
                  hasSticky && 'max-lg:scale-110'
                )}
                style={
                  { '--sidebar-top': `${height}px` } as React.CSSProperties
                }
              >
                {items.map((item) => (item.children ? (
                  <AccordionItem key={item.label} value={item.label}>
                    <SidebarItem>
                      <AccordionTrigger className="w-full px-10 py-2">
                        {item.label}
                      </AccordionTrigger>
                    </SidebarItem>
                    <AccordionContent className="*:my-2 *:aria-hidden:my-0">
                      {item.children.map(
                        (child) => child.href && (
                          <SidebarLink
                            key={child.href}
                            className="pl-14"
                            href={child.href}
                            isActive={child.isActive}
                            isDisabled={child.isDisabled}
                          >
                            {child.label}
                          </SidebarLink>
                        )
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ) : (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    isActive={item.isActive}
                    isDisabled={item.isDisabled}
                  >
                    {item.label}
                  </SidebarLink>
                )))}
              </SidebarWrapper>
            </Accordion>
          )}

          <div className="max-w-full basis-full lg:max-w-[min(760px,100%-360px)] lg:flex-1">
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
}
