import Link from "next/link";
import { MARATHON_LINKS, NAV_LINK, USER_LINK } from "@/constants/category";
import { useAuth, useAuthDispatch } from "@/contexts/Auth";
import { cn } from "@/utils/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

function DesktopMenu() {
  const auth = useAuth();
  const authDispatch = useAuthDispatch();

  return (
    <>
      <nav>
        <ul className="flex items-center gap-1">
          {NAV_LINK.map(({ link, name, target }) => (
            <li key={name}>
              <Link
                href={link}
                target={target}
                className="block p-5 font-bold text-basic-white"
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <nav className="flex items-center gap-3.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "my-4 py-1.5 pl-3 pr-1 flex items-center gap-1",
              "font-bold rounded-lg text-basic-white bg-transparent",
              "data-[state=open]:text-primary-base data-[state=open]:bg-primary-lightest",
              "transition-colors [&[data-state=open]>svg]:rotate-180"
            )}
          >
            島島盃-春季學習馬拉松
            <ChevronDown className="size-4 transition-transform" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mt-1">
            {MARATHON_LINKS.map(({ name, link }) => (
              <DropdownMenuItem
                key={name}
                className="rounded-lg text-nowrap hover:bg-primary-lightest"
                asChild
              >
                <Link href={link}>{name}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {auth.isLoggedIn ? (
          <nav className="flex items-center gap-3.5">
            <Link
              href="/manage"
              className="px-2 py-5 text-basic-white body-md font-bold"
            >
              我的小島
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="p-0">
                <img
                  src={auth.user.photoURL}
                  alt={auth.user.name}
                  width="40"
                  height="40"
                  className="rounded-full"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2">
                {USER_LINK.map(({ name, id }) => (
                  <DropdownMenuItem
                    key={name}
                    className="rounded-lg text-nowrap hover:bg-primary-lightest"
                    asChild
                  >
                    <Link
                      href={`/profile?id=${id}`}
                      className="block p-2 text-basic-400"
                    >
                      {name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  className="rounded-lg text-nowrap hover:bg-primary-lightest"
                  asChild
                >
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
          </nav>
        ) : (
          <button
            type="button"
            className="text-basic-white my-4 px-4 py-1.5 rounded-full border border-basic-white"
            onClick={() => authDispatch.openLoginModal()}
          >
            登入
          </button>
        )}
      </nav>
    </>
  );
}

export default DesktopMenu;
