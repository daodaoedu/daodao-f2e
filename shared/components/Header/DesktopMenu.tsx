import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useRef, useEffect } from 'react';
import { MARATHON_LINKS, NAV_LINK, USER_LINK } from '@/constants/category';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';
import { cn } from '@/utils/cn';
import Dropdown from '../Dropdown';

function DesktopMenu() {
  const auth = useAuth();
  const authDispatch = useAuthDispatch();
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 根據當前路徑判斷哪個導航項目是活躍的
  const getActiveSection = () => {
    const path = router.pathname;

    // 檢查是否是探索相關頁面
    const isExplore = NAV_LINK[0].children?.some((child) => path.startsWith(child.link));
    if (isExplore) return NAV_LINK[0].section;

    // 檢查是否是交流相關頁面
    const isExchange = NAV_LINK[1].children?.some((child) => path.startsWith(child.link));
    if (isExchange) return NAV_LINK[1].section;

    return null;
  };

  const activeSection = getActiveSection();

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && dropdownRefs.current[activeDropdown]) {
        const element = dropdownRefs.current[activeDropdown];
        if (element && !element.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // 處理下拉選單切換
  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => prev === name ? null : name);
  };

  return (
    <>
      <nav>
        <ul className="flex items-center gap-1">
          {NAV_LINK.map(({ link, name, target, children, section }) => (
            <li key={name}>
              {children ? (
                <div
                  className="relative"
                  ref={(el) => dropdownRefs.current[name] = el}
                >
                  <div className="flex items-center">
                    <Link
                      href={link}
                      className={cn(
                        "block p-5 font-bold text-basic-white relative",
                        "hover:bg-primary-dark/10 transition-colors",
                        (activeSection === section) && "bg-primary-dark/10"
                      )}
                    >
                      {name}
                    </Link>
                    <button
                      className={cn(
                        "p-5 font-bold text-basic-white relative",
                        "hover:bg-primary-dark/10 transition-colors",
                        (activeDropdown === name) && "bg-primary-dark/10"
                      )}
                      onClick={() => toggleDropdown(name)}
                    >
                      <svg
                        className={cn(
                          "w-4 h-4 transition-transform",
                          activeDropdown === name ? "rotate-180" : ""
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* 下拉選單 */}
                  <div
                    className={cn(
                      "absolute top-full right-0 bg-white rounded-lg shadow-lg py-2 min-w-48 z-30",
                      "transition-all duration-200 origin-top",
                      activeDropdown === name
                        ? "opacity-100 scale-y-100 translate-y-0"
                        : "opacity-0 scale-y-0 -translate-y-2 pointer-events-none"
                    )}
                  >
                    {children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.link}
                        target={child.target}
                        className="block px-4 py-2 text-gray-700 hover:bg-primary-lightest hover:text-primary-base"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  href={link}
                  target={target}
                  className={cn(
                    "block p-5 font-bold text-basic-white",
                    "hover:bg-primary-dark/10 transition-colors"
                  )}
                >
                  {name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-3.5">
        <Dropdown as="nav">
          <Dropdown.Toggle
            className={cn(
              'my-4 py-1.5 pl-3 pr-1 font-bold rounded-lg transition-colors',
              'text-basic-white hover:text-basic-white bg-transparent',
              'aria-pressed:text-primary-base aria-pressed:bg-primary-lightest'
            )}
            withIcon
          >
            島島盃-春季學習馬拉松
          </Dropdown.Toggle>
          <Dropdown.List className="mt-1">
            {MARATHON_LINKS.map(({ name, link }) => (
              <Dropdown.Item
                key={name}
                className="rounded-lg text-nowrap hover:bg-primary-lightest"
              >
                <Link href={link} className="block p-2 text-basic-400">
                  {name}
                </Link>
              </Dropdown.Item>
            ))}
          </Dropdown.List>
        </Dropdown>

        {auth.isLoggedIn ? (
          <div className="flex items-center gap-3.5">
            <Link
              href="/manage"
              className="px-2 py-5 text-basic-white body-md font-bold"
            >
              我的小島
            </Link>
            <Dropdown as="nav">
              <Dropdown.Toggle animation="none" className="p-0">
                <img
                  src={auth.user.photoURL}
                  alt={auth.user.name}
                  width="40"
                  height="40"
                  className="rounded-full"
                />
              </Dropdown.Toggle>
              <Dropdown.List className="mt-2">
                {USER_LINK.map(({ name, id }) => (
                  <Dropdown.Item
                    key={name}
                    className="rounded-lg text-nowrap hover:bg-primary-lightest"
                  >
                    <Link
                      href={`/profile?id=${id}`}
                      className="block p-2 text-basic-400"
                    >
                      {name}
                    </Link>
                  </Dropdown.Item>
                ))}
                <Dropdown.Item className="rounded-lg text-nowrap hover:bg-primary-lightest">
                  <button
                    type="button"
                    className="block p-2 text-basic-400"
                    onClick={() => authDispatch.logout()}
                  >
                    登出
                  </button>
                </Dropdown.Item>
              </Dropdown.List>
            </Dropdown>
          </div>
        ) : (
          <button
            type="button"
            className="text-basic-white my-4 px-4 py-1.5 rounded-full border border-basic-white hover:bg-white/10 transition-colors"
            onClick={() => authDispatch.openLoginModal()}
          >
            登入
          </button>
        )}
      </div>
    </>
  );
}

export default DesktopMenu;
