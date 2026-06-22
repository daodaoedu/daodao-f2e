/**
 * Returns true if navigation should be blocked due to unsaved changes.
 *
 * Uses `isSavedSuccessfully` to prevent false positives where SWR's
 * re-fetch after save briefly makes `isDirty` true again.
 */
export function shouldBlockNavigation(
  isDirty: boolean,
  hasAvatarFile: boolean,
  isSavedSuccessfully: boolean,
): boolean {
  return (isDirty || hasAvatarFile) && !isSavedSuccessfully;
}
