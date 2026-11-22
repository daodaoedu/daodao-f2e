export type TextSegment = { type: "text"; value: string } | { type: "url"; value: string };

// 網址遇到空白或全形標點就結束：中文常把「。」「，」直接接在網址後面，不能算進連結
const URL_PATTERN = /https?:\/\/[^\s，。！？、；：「」『』（）【】《》〈〉]+(?<![.?!,;:])/g;

export function parseTextLinks(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index;
    if (start > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, start) });
    }
    segments.push({ type: "url", value: match[0] });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: text }];
}
