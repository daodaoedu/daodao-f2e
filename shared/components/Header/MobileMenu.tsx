import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MARATHON_LINKS, NAV_LINK, USER_LINK } from '@/constants/category';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';
import { cn } from '@/utils/cn';
import Collapse from '../Collapse';

function MobileMenu() {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const auth = useAuth();
  const authDispatch = useAuthDispatch();

  useEffect(() => {
    if (isOpenMenu) {
      document.body.classList.add('overflow-y-hidden');
    } else {
      document.body.classList.remove('overflow-y-hidden');
    }
  }, [isOpenMenu]);

  return (
    <>
      <button
        type="button"
        title="menu"
        className="text-transparent flex flex-col items-center justify-center gap-1.5 size-14 overflow-hidden"
        onClick={() => setIsOpenMenu(!isOpenMenu)}
      >
        <div
          className={cn(
            'w-6 h-0.5 bg-basic-white transition-transform origin-top-right pointer-events-none',
            isOpenMenu ? '-rotate-45' : 'rotate-0'
          )}
        />
        <div
          className={cn(
            'w-6 h-0.5 bg-basic-white transition-[transform,opacity] origin-left pointer-events-none',
            isOpenMenu
              ? 'translate-x-full opacity-0'
              : 'translate-x-0 opacity-100'
          )}
        />
        <div
          className={cn(
            'w-6 h-0.5 bg-basic-white transition-transform origin-bottom-right pointer-events-none',
            isOpenMenu ? 'rotate-45' : 'rotate-0'
          )}
        />
      </button>
      <div
        className={cn(
          'absolute top-full inset-x-0 bg-basic-white transition-[min-height] overflow-auto h-0',
          'data-[is-open=true]:min-h-screen-without-padding-top data-[is-open=false]:min-h-0'
        )}
        data-is-open={isOpenMenu}
      >
        <div className="flex flex-col">
          <nav>
            <ul className="pt-2">
              {NAV_LINK.map(({ link, name, target }) => (
                <li key={name}>
                  <Link
                    href={link}
                    target={target}
                    className="block px-10 py-2 text-basic-400"
                    onClick={() => setIsOpenMenu(false)}
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Collapse as="nav">
            <Collapse.Toggle
              className="py-2 px-10 flex items-center rounded-lg text-primary-base w-full"
              withIcon
            >
              島島盃-春季學習馬拉松
            </Collapse.Toggle>
            <Collapse.List className="w-full">
              {MARATHON_LINKS.map(({ name, link, disabled }) => (
                <Collapse.Item key={name} className="*:px-16 *:leading-10">
                  {disabled ? (
                    <div className="text-basic-300 cursor-not-allowed">
                      {name}
                    </div>
                  ) : (
                    <Link
                      href={link}
                      className="block text-basic-400"
                      onClick={() => setIsOpenMenu(false)}
                    >
                      {name}
                    </Link>
                  )}
                </Collapse.Item>
              ))}
            </Collapse.List>
          </Collapse>
          {auth.isLoggedIn ? (
            <Collapse as="nav">
              <Collapse.Toggle className="w-full mt-4" withIcon>
                <div className="absolute top-0 left-0 border-x-[20px] mt-2 border-white border-solid w-full h-px bg-primary-lightest" />
                <div className="py-2 pl-10 flex items-center gap-2">
                  <img
                    src={auth.user.photoURL}
                    alt={auth.user.name}
                    width="40"
                    height="40"
                    className="rounded-full"
                  />
                  <span className="text-basic-400">{auth.user.name}</span>
                </div>
              </Collapse.Toggle>
              <Collapse.List>
                {USER_LINK.map(({ name, id }) => (
                  <Collapse.Item key={name}>
                    <Link
                      href={`/profile?id=${id}`}
                      className="block px-16 py-2 text-basic-400"
                      onClick={() => setIsOpenMenu(false)}
                    >
                      {name}
                    </Link>
                  </Collapse.Item>
                ))}
                <Collapse.Item>
                  <button
                    type="button"
                    className="block text-left px-16 py-2 text-basic-400"
                    onClick={() => {
                      authDispatch.logout();
                      setIsOpenMenu(false);
                    }}
                  >
                    登出
                  </button>
                </Collapse.Item>
              </Collapse.List>
            </Collapse>
          ) : (
            <button
              type="button"
              className="text-basic-400 mx-4 mt-2 mb-4 py-1.5 flex-1 rounded-full border border-primary-base"
              onClick={() => {
                authDispatch.openLoginModal();
                setIsOpenMenu(false);
              }}
            >
              登入
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default MobileMenu;
