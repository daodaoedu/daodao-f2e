import { CustomLink } from '@/shared/ui/custom-link';
import { MARATHON_LINKS, NAV_LINK, USER_LINK } from '@/constants/category';
import { useSession, useSessionActions } from '@/entities/session';
import { cn } from '@/shared/lib/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Image } from '@/shared/ui/image';
import { Button } from '@/shared/ui/button';

function DesktopMenu() {
  const auth = useSession();
  const authDispatch = useSessionActions();

  return (
    <>
      <nav>
        <ul className="flex items-center gap-1">
          {NAV_LINK.map(({ link, name, target }) => (
            <li key={name}>
              <CustomLink
                href={link}
                target={target}
                className="block p-5 font-bold text-basic-white"
              >
                {name}
              </CustomLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center gap-3.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'my-4 py-1.5 pl-3 pr-1 font-bold rounded-lg transition-colors',
                'text-basic-white hover:text-basic-white bg-transparent',
                'aria-pressed:text-primary-base aria-pressed:bg-primary-lightest'
              )}
            >
              島島盃-春季學習馬拉松
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mt-1">
            {MARATHON_LINKS.map(({ name, link }) => (
              <DropdownMenuItem
                key={name}
                className="text-nowrap rounded-lg hover:bg-primary-lightest"
                asChild
              >
                <CustomLink href={link} className="block p-2 text-basic-400">
                  {name}
                </CustomLink>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {auth.isLoggedIn ? (
          <div className="flex items-center gap-3.5">
            <CustomLink
              href="/manage"
              className="body-md px-2 py-5 font-bold text-basic-white"
            >
              我的小島
            </CustomLink>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0">
                  <Image
                    src={auth.user.photoURL ?? ''}
                    alt={auth.user.name ?? 'user avatar'}
                    width="40"
                    height="40"
                    className="rounded-full"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2">
                {USER_LINK.map(({ name, id }) => (
                  <DropdownMenuItem
                    key={name}
                    className="text-nowrap rounded-lg hover:bg-primary-lightest"
                    asChild
                  >
                    <CustomLink
                      href={`/profile?id=${id}`}
                      className="block p-2 text-basic-400"
                    >
                      {name}
                    </CustomLink>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem className="text-nowrap rounded-lg hover:bg-primary-lightest">
                  <button
                    type="button"
                    className="block p-2 text-basic-400"
                    onClick={() => authDispatch.logout()}
                  >
                    登出
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <button
            type="button"
            className="my-4 rounded-full border border-basic-white px-4 py-1.5 text-basic-white"
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
