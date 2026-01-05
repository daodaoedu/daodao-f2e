import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export {
  useParams,
  notFound,
  useSearchParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
} from "next/navigation";
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
