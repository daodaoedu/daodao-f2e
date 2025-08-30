import { notFound } from 'next/navigation';

export const getDynamicRoute = <T>(
  key: string,
  routeMap: Record<string, T>
): T => {
  const checkRoute = (route: string): route is keyof typeof routeMap =>
    Object.keys(routeMap).includes(route);

  if (!checkRoute(key)) notFound();
  return routeMap[key];
};
