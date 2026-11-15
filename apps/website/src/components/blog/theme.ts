const STORAGE_KEY = "daodao-blog-theme";

type ThemeStorageType = Pick<Storage, "getItem" | "setItem">;

/** Returns the reader's saved Journal theme; light when nothing usable is stored. */
export function readBlogDark(storage: ThemeStorageType | undefined): boolean {
  try {
    return storage?.getItem(STORAGE_KEY) === "dark";
  } catch {
    // Private mode or blocked site data: fall back to light without breaking the page.
    return false;
  }
}

export function writeBlogDark(storage: ThemeStorageType | undefined, dark: boolean): void {
  try {
    storage?.setItem(STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    // Persisting is a convenience; the toggle still works for this page.
  }
}
