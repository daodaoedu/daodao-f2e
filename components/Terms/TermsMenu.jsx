import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const TermsMenu = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <nav className="sticky top-[138px] left-0 py-10 pr-4 mr-4 bg-white w-[200px] rounded shadow-[0px_2px_1px_-1px_rgba(0,0,0,0.2),0px_1px_1px_0px_rgba(0,0,0,0.14),0px_1px_3px_0px_rgba(0,0,0,0.12)] max-[1040px]:hidden [&>h2]:mb-4 [&>h2]:px-4 [&>h2]:font-medium [&>h2]:text-lg [&>ul]:list-none [&>ul]:p-0 [&>ul]:m-0 [&>li]:mb-2.5 [&>a]:text-[#16b9b3] [&>a]:px-4 hover:[&>a]:underline hover:[&>a]:underline-offset-1 [&>.current]:relative [&>.current:before]:content-[''] [&>.current:before]:absolute [&>.current:before]:left-0 [&>.current:before]:top-1/2 [&>.current:before]:-translate-y-1/2 [&>.current:before]:w-0 [&>.current:before]:h-0 [&>.current:before]:border-t-[0.5em] [&>.current:before]:border-t-transparent [&>.current:before]:border-b-[0.5em] [&>.current:before]:border-b-transparent [&>.current:before]:border-l-[0.5em] [&>.current:before]:border-l-[#16b9b3] [&>.current:before]:border-r-[0.5em] [&>.current:before]:border-r-transparent">
      <h2>網站規約</h2>
      <ul>
        <li>
          <Link
            href="/terms/privacypolicy"
            className={currentPath === '/terms/privacypolicy' ? 'current' : ''}
          >
            隱私權政策
          </Link>
        </li>
        <li>
          <Link
            href="/terms/ipr"
            className={currentPath === '/terms/ipr' ? 'current' : ''}
          >
            智慧財產權
          </Link>
        </li>
        <li>
          <Link
            href="/terms/service"
            className={currentPath === '/terms/service' ? 'current' : ''}
          >
            使用者條款
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default TermsMenu;
