'use client';

import { useLocale } from 'next-intl';
import NextLink from 'next/link';
import {
  usePathname as useNextPathname,
  useRouter as useNextRouter,
} from 'next/navigation';
import { routing } from './routing';

type LinkProps = React.ComponentProps<typeof NextLink>;

interface NavigateOptions {
  scroll?: boolean;
  locale?: string;
}

const mergeHref = <T extends LinkProps['href']>(href: T, locale: string): T => {
  if (locale === routing.defaultLocale) {
    return href;
  }
  if (typeof href === 'object') {
    return {
      ...href,
      pathname: `/${locale}/${href.pathname}`,
    };
  }
  return `/${locale}/${href}` as T;
};

const Link = (props: LinkProps) => {
  const { href, locale, ...rest } = props;
  const currentLocale = useLocale();
  const targetLocale = locale || currentLocale;
  const localizedHref = mergeHref(href, targetLocale);
  return <NextLink href={localizedHref} {...rest} />;
};

const usePathname = () => {
  const currentLocale = useLocale();
  const pathname = useNextPathname();
  return pathname ? mergeHref(pathname, currentLocale) : null;
};

const useRouter = () => {
  const router = useNextRouter();
  const locale = useLocale();
  return {
    ...router,
    push: (href: string, options?: NavigateOptions) => {
      const targetLocale = options?.locale || locale;
      const localizedHref = mergeHref(href, targetLocale);
      router.push(localizedHref, options);
    },
    replace: (href: string, options?: NavigateOptions) => {
      const targetLocale = options?.locale || locale;
      const localizedHref = mergeHref(href, targetLocale);
      router.replace(localizedHref, options);
    },
  };
};

export { Link, usePathname, useRouter };
