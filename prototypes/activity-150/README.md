# Activity 150 prototype

Static prototype for the activity detail page and the cohort join flow.

## Preview

From this directory, run `python -m http.server 4173`, then open:

- `http://localhost:4173/` — activity detail page
- `http://localhost:4173/join.html` — cohort join page

The join checkbox and button only preview the local consent state. They do not submit a real cohort application or change an account. Page content is static sample data based on activity 150 and its Lighthouse cohort settings.

## Review notes

- The organizer name and description currently show the PM acceptance placeholder from the source activity; replace them with approved production copy before implementation.
- The host profile link is a prototype destination and should be verified against the intended user profile.
- The join page follows the Lighthouse invite message text and paragraph breaks; it does not load that content from Lighthouse.
