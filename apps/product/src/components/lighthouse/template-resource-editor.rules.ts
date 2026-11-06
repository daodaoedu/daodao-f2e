import {
  normalizeResourceUrl,
  TEMPLATE_RESOURCES_MAX,
  validateResourceUrl,
} from "@/utils/template-library";

interface IEditorResource {
  key: string;
  name: string;
  url: string;
}

type ResourceModeType = "template" | "cohort";
type ResourceErrorType =
  | "name"
  | "nameMax"
  | "invalid"
  | "https"
  | "duplicateUrl"
  | "duplicateName"
  | "full";
type ResourceValidationType =
  | { value: { name: string; url: string }; error?: never }
  | { error: ResourceErrorType; value?: never };

/** Normalize cohort links; a bare hostname (including localhost:port) implies HTTPS. */
function prepareCohortUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const hasHttpScheme = /^https?:\/\//i.test(trimmed);
  const hasOtherScheme =
    /^[a-z][a-z\d+.-]*:/i.test(trimmed) &&
    !/^(?:localhost|[^/?#:]+\.[^/?#:]+):\d+(?:[/?#]|$)/i.test(trimmed);
  try {
    if ((!hasHttpScheme && hasOtherScheme) || /[\\\s]/.test(trimmed)) return null;
    const url = new URL(hasHttpScheme ? trimmed : `https://${trimmed}`);
    return ["http:", "https:"].includes(url.protocol) && url.hostname && url.href.length <= 1000
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/** URL validation also precedes local name inference when adding a link. */
export function prepareEditorResourceUrl(
  value: string,
  mode: ResourceModeType
): { url: string; error?: never } | { error: "invalid" | "https"; url?: never } {
  const trimmed = value.trim();
  if (mode === "cohort") {
    const normalized = prepareCohortUrl(trimmed);
    return normalized === null ? { error: "invalid" } : { url: normalized };
  }
  if (trimmed) {
    const problem = validateResourceUrl(trimmed);
    if (problem === "invalid" || problem === "https") return { error: problem };
  }
  return { url: trimmed };
}

/** Validate a whole candidate so add/edit obey the same name, URL, duplicate and limit rules. */
export function validateEditorResource(
  candidate: { name: string; url: string },
  resources: IEditorResource[],
  mode: ResourceModeType,
  exceptKey?: string,
  maxResources = mode === "cohort" ? 50 : TEMPLATE_RESOURCES_MAX
): ResourceValidationType {
  if (exceptKey === undefined && resources.length >= maxResources) return { error: "full" };
  const name = candidate.name.trim();
  if (!name) return { error: "name" };
  if (name.length > 100) return { error: "nameMax" };
  const checkedUrl = prepareEditorResourceUrl(candidate.url, mode);
  if (checkedUrl.error) return { error: checkedUrl.error };
  const url = checkedUrl.url;
  const others = resources.filter((item) => item.key !== exceptKey);
  if (
    url &&
    others.some((item) => item.url && normalizeResourceUrl(item.url) === normalizeResourceUrl(url))
  ) {
    return { error: "duplicateUrl" };
  }
  if (
    (mode === "template" || !url) &&
    others.some(
      (item) =>
        (mode === "template" || !item.url) && item.name.trim().toLowerCase() === name.toLowerCase()
    )
  ) {
    return { error: "duplicateName" };
  }
  return { value: { name, url } };
}
