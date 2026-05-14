export interface MentionParticipant {
  userId: string;
  name: string;
  customId?: string | null;
}

export type MentionContentSegment =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "mention";
      text: string;
      href: string | null;
    };

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getMentionBoundaryPattern(name: string) {
  return new RegExp(`^@${escapeRegExp(name)}(?=$|[\\s,!?.。、，！？])`);
}

export function getParticipantIslandHref(participant: MentionParticipant) {
  const identifier = participant.customId || participant.userId;
  return identifier ? `/users/${identifier}` : null;
}

export function tokenizeMentionContent(
  content: string,
  participants: MentionParticipant[]
): MentionContentSegment[] {
  if (!content) return [];

  const sortedParticipants = [...participants]
    .filter((participant) => participant.name.trim())
    .sort((a, b) => b.name.length - a.name.length);

  const segments: MentionContentSegment[] = [];
  let cursor = 0;
  let textStart = 0;

  while (cursor < content.length) {
    if (content[cursor] !== "@") {
      cursor += 1;
      continue;
    }

    const remaining = content.slice(cursor);
    const participant = sortedParticipants.find((candidate) =>
      getMentionBoundaryPattern(candidate.name).test(remaining)
    );

    if (!participant) {
      cursor += 1;
      continue;
    }

    if (textStart < cursor) {
      segments.push({ type: "text", text: content.slice(textStart, cursor) });
    }

    const text = `@${participant.name}`;
    segments.push({
      type: "mention",
      text,
      href: getParticipantIslandHref(participant),
    });
    cursor += text.length;
    textStart = cursor;
  }

  if (textStart < content.length) {
    segments.push({ type: "text", text: content.slice(textStart) });
  }

  return segments;
}
