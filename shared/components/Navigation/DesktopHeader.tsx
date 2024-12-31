import Link from "next/link";
import { MARATHON_LINKS, NAV_LINK, USER_LINK } from "@/constants/category";
import { useAuth, useAuthDispatch } from "@/contexts/Auth";
import { cn } from "@/utils/cn";
import Dropdown from "../Dropdown";

function DesktopHeader() {
  const auth = useAuth();
  const authDispatch = useAuthDispatch();
  const avatar = auth.user && (
    <img
      src={auth.user.photoURL}
      alt={auth.user.name}
      width="40"
      height="40"
      className="rounded-full"
    />
  );

  return (
    <header className="flex items-center justify-between w-full px-4 bg-primary-base">
      <Link href="/" className="block py-5">
        <img src="/new-logo.png" alt="logo" width="152" height="31" />
      </Link>
      <nav>
        <ul className="flex items-center gap-1">
          {NAV_LINK.map(({ link, name, target }) => (
            <li key={name}>
              <Link href={link} target={target} className="block p-5 font-bold">
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center gap-3.5">
        <Dropdown
          rootElement="nav"
          wrapperElement="ul"
          trigger="島島盃-春季學習馬拉松"
          className={cn(
            "my-4 py-1.5 pl-3 pr-1 font-bold rounded-lg transition-colors",
            "text-basic-white bg-transparent",
            "aria-pressed:text-primary-base aria-pressed:bg-primary-lightest"
          )}
          wrapperClassName="top-full left-0 -mt-1"
          withIcon
        >
          {MARATHON_LINKS.map(({ name, link, disabled }) => (
            <li
              key={name}
              className="rounded-lg text-nowrap hover:bg-primary-lightest"
            >
              {disabled ? (
                <div className="p-2 text-basic-300 cursor-not-allowed">
                  {name}
                </div>
              ) : (
                <Link href={link} className="block p-2 text-basic-400">
                  {name}
                </Link>
              )}
            </li>
          ))}
        </Dropdown>
        {auth.isLoggedIn ? (
          <div className="flex items-center">
            <Dropdown
              rootElement="nav"
              wrapperElement="ul"
              trigger={avatar}
              wrapperClassName="top-full right-0 mt-2"
            >
              {USER_LINK.map(({ name, id }) => (
                <li
                  key={name}
                  className="rounded-lg text-nowrap hover:bg-primary-lightest"
                >
                  <Link
                    href={`/profile?id=${id}`}
                    className="block p-2 text-basic-400"
                  >
                    {name}
                  </Link>
                </li>
              ))}
              <li className="rounded-lg text-nowrap hover:bg-primary-lightest">
                <button
                  type="button"
                  className="block p-2 text-basic-400"
                  onClick={() => authDispatch.logout()}
                >
                  登出
                </button>
              </li>
            </Dropdown>
          </div>
        ) : (
          <button
            type="button"
            className="text-basic-white my-4 px-4 py-1.5 rounded-full border border-basic-white"
            onClick={() => authDispatch.openLoginModal()}
          >
            登入
          </button>
        )}
      </div>
    </header>
  );
}

export default DesktopHeader;
