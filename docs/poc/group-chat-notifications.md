# Group chat notifications POC

This branch collects the front-end reference for group-chat mentions, unread-message navigation, and email/in-app notification display.

## Review the experience

- Open `/email-notification-preview.html` in the product app. Switch between **Mention** and **New message**, and between **English** and **繁體中文**. The preview uses synthetic names and room data; its button links to a sample room.
- Open `/en/messages/<roomId>` or `/zh-TW/messages/<roomId>` in an authenticated dev session to review the chat. Type `@` to see member suggestions above the composer. `@all` is offered only to hosts.
- In the in-app notification list, mention notifications identify the sender and room; general notifications identify the sender and room without exposing message content. Clicking opens that room. When unread messages exist, the chat opens at the first unread message.
- Review the message link styling and the chat layout at desktop, tablet, and mobile widths.

## Scope and assumptions

- Notification copy and preview data are synthetic. The email preview is a static UI artifact, not a delivered email.
- This is the `daodao-f2e` portion of the POC. Live email and in-app events require the companion `daodao-server` changes for event creation, notification processing, response payloads, and the first-unread room field. Those server changes are not included in this branch.
- `packages/api/src/types.ts` includes the local POC's chat contract fields so the front end can be reviewed alongside that server work. Regenerate it from the server OpenAPI contract when the backend change is ready to integrate.
- This branch is an engineer-review reference, not a production-readiness or full QA claim.
