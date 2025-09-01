'use client';

import Link from 'next/link';
import { CSSProperties, useEffect, useState } from 'react';
import { usePromotion } from '@/contexts/Promotion';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import ApplyButton from './ApplyButton';

export default function Sidebar() {
  const { height } = usePromotion();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isShow, setIsShow] = useState(false);
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);

  const sidebarItems = [
    { label: '活動介紹', href: '#marathon-intro' },
    { label: '馬拉松進行方式', href: '#marathon-how' },
    { label: '引導師介紹', href: '#marathon-mentor' },
    { label: '你可以預期的收穫', href: '#marathon-benefit' },
    { label: '成果發表與獎勵', href: '#marathon-reward' },
    { label: '如何申請', href: '#marathon-apply' },
    { label: '本計畫價值', href: '#marathon-price' },
    { label: 'FAQ', href: '#marathon-faq' },
  ];

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('main h2'));
    const filteredHeadings = headings.filter((heading) =>
      sidebarItems.some((item) => item.href.replace('#', '') === heading.id)
    );
    const sections = filteredHeadings
      .map((heading) => heading.parentElement)
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry?.target?.children?.[0]?.id);
        }
      });
    });

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const bannerElement = document.querySelector('main')
      ?.children?.[0] as HTMLElement;
    const bannerHeight = bannerElement?.offsetHeight || 0;
    const handleScroll = () => {
      if (
        window.scrollY < bannerHeight - height ||
        window.scrollY + window.innerHeight > document.body.scrollHeight - 250
      ) {
        setIsShow(false);
      } else {
        setIsShow(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [height]);

  return (
    <>
      <aside
        className={cn(
          'bottom-24 right-8 lg:bottom-auto lg:right-auto',
          'fixed max-h-[calc(100vh-var(--sidebar-top)-24px)] overflow-y-auto lg:left-8 lg:top-[var(--sidebar-top)]',
          'z-20 rounded-lg bg-white p-2 shadow-md transition-opacity duration-300',
          isShow
            ? 'lg:pointer-events-auto lg:opacity-100'
            : 'lg:pointer-events-none lg:opacity-0',
          isOpenSidebar
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
        style={{ '--sidebar-top': `${height + 100}px` } as CSSProperties}
      >
        <ul className="mb-2 flex flex-col gap-2">
          {sidebarItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  'block rounded-lg p-2.5 text-base font-medium text-basic-400 transition-colors duration-300',
                  activeSection === item.href.replace('#', '') &&
                    'bg-primary-lightest text-primary-base'
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <ApplyButton className="mx-auto inline-block h-10 w-full rounded-[20px] bg-[#16B9B3] px-5 py-2.5 text-base font-normal leading-[140%] text-white hover:bg-[#16B9B3] hover:shadow-[0px_4px_10px_0px_rgba(89,182,178,0.50)]">
          立即申請
        </ApplyButton>
      </aside>
      <div
        className={cn(
          'fixed bottom-8 right-8 z-20 transition-opacity duration-300 lg:hidden',
          isShow ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <button
          type="button"
          className="rounded-full bg-primary-base p-3 text-white shadow-md shadow-primary-base"
          onClick={() => setIsOpenSidebar(!isOpenSidebar)}
        >
          <ChevronUp
            className={cn(
              'size-6 text-white transition-transform duration-300',
              isOpenSidebar ? 'rotate-0' : '-rotate-180'
            )}
          />
        </button>
      </div>
    </>
  );
}
