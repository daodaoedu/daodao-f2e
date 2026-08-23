/**
 * Returns the path the X button should navigate to on the check-in detail page.
 *
 * When the user arrives from the inspire feed (from=inspire), closing should
 * return them to the feed rather than the practice detail page.
 */
export function getCheckInBackPath(practiceDetailPath: string, from: string | null): string {
  if (from === "inspire") {
    return "/";
  }
  return practiceDetailPath;
}
