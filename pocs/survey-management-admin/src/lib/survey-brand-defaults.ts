export interface SurveyBrandDefaults {
  logo: string;
  banner: string;
}

export interface SurveyLibraryImage {
  url: string;
  kind: keyof SurveyBrandDefaults;
  title: string;
}

const STORAGE_KEY = "daodao-survey-brand-defaults";

export function getSurveyBrandDefaults(): SurveyBrandDefaults {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const value: unknown = stored ? JSON.parse(stored) : null;
    if (typeof value !== "object" || value === null) return { logo: "", banner: "" };
    const defaults = value as Record<string, unknown>;
    return {
      logo: typeof defaults.logo === "string" ? defaults.logo : "",
      banner: typeof defaults.banner === "string" ? defaults.banner : "",
    };
  } catch {
    return { logo: "", banner: "" };
  }
}

export function getSurveyImageLibrary(): SurveyLibraryImage[] {
  const images = new Map<string, SurveyLibraryImage>();
  const defaults = getSurveyBrandDefaults();
  if (defaults.logo)
    images.set(defaults.logo, { url: defaults.logo, kind: "logo", title: "預設 Logo" });
  if (defaults.banner)
    images.set(defaults.banner, { url: defaults.banner, kind: "banner", title: "預設問卷橫幅" });

  try {
    const stored = window.localStorage.getItem("daodao-preview-surveys");
    const surveys: unknown = stored ? JSON.parse(stored) : [];
    if (Array.isArray(surveys)) {
      surveys.forEach((survey, index) => {
        if (typeof survey !== "object" || survey === null) return;
        const record = survey as Record<string, unknown>;
        const surveyTitle =
          typeof record.title === "string" && record.title.trim()
            ? record.title
            : `未命名問卷 ${index + 1}`;
        if (typeof record.logo_url === "string" && record.logo_url) {
          images.set(record.logo_url, {
            url: record.logo_url,
            kind: "logo",
            title: `${surveyTitle} · Logo`,
          });
        }
        if (typeof record.cover_url === "string" && record.cover_url) {
          images.set(record.cover_url, {
            url: record.cover_url,
            kind: "banner",
            title: `${surveyTitle} · 問卷橫幅`,
          });
        }
      });
    }
  } catch {
    // Keep image selection available even when the local preview library cannot be read.
  }

  return [...images.values()];
}
