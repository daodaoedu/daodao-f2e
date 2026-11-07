# Mobile Navigation Refinement POC

## Intent

Align the mobile navigation with the desktop navigation while keeping the mobile layout compact:

- Remove the Home item from the bottom bar. The DaoDao logo at the upper left still links to `/`.
- Add the Spaces icon and desktop-style breathing dot. Spaces, activities, and challenges mark it active.
- Use the same Lighthouse icon for the mobile account sheet that desktop navigation uses.
- Make the center `+` open the same practice, activity, and admin-only challenge choices as the desktop add-task button. The button changes to `X`; clicking outside or pressing Escape closes the menu.

## Review

Review at a mobile viewport while signed in, then compare the icon and create-menu behavior with the desktop sidebar and add-task button. Confirm the logo still opens the homepage and that the challenge choice only appears for admin users.

The challenge choice currently has the same no-op selection behavior as the existing desktop add-task menu.

## Scope and checks

This POC only changes the mobile sidebar, the mobile account sheet Lighthouse icon, and this note. It does not include the local-cohort auto sign-in work from the separate working tree.

`git diff --check` passed. A browser review, lint, and typecheck have not been run on this isolated branch.

## Related work

The previously merged mobile navigation POC is [PR #1085](https://github.com/daodaoedu/daodao-f2e/pull/1085). This branch is a new refinement based on current `dev`.
