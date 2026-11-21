import { parseTextLinks } from "@daodao/shared/lib/parse-text-links";
import { Fragment } from "react";
import { isCheckInNextStepHeading } from "../form/description-answers";

interface ICheckInDescriptionTextProps {
  content: string;
  linkify?: boolean;
}

export function CheckInDescriptionText({
  content,
  linkify = false,
}: ICheckInDescriptionTextProps) {
  const lines = content.split(/(\r?\n)/);

  return lines.map((line, lineIndex) => {
    if (/^\r?\n$/.test(line)) {
      return <Fragment key={`line-${lineIndex}`}>{line}</Fragment>;
    }

    if (isCheckInNextStepHeading(line)) {
      const hasNextStepAnswer = lines
        .slice(lineIndex + 1)
        .some((nextLine) => nextLine.trim() && !isCheckInNextStepHeading(nextLine));

      if (!hasNextStepAnswer) return null;

      return (
        <em key={`heading-${lineIndex}`} className="italic">
          {line}
        </em>
      );
    }

    if (!linkify) return <Fragment key={`line-${lineIndex}`}>{line}</Fragment>;

    return (
      <Fragment key={`line-${lineIndex}`}>
        {parseTextLinks(line).map((segment, segmentIndex) =>
          segment.type === "url" &&
          (segment.value.startsWith("https://") || segment.value.startsWith("http://")) ? (
            <a
              key={`url-${segmentIndex}`}
              href={segment.value}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-logo-cyan underline"
            >
              {segment.value}
            </a>
          ) : (
            <Fragment key={`text-${segmentIndex}`}>{segment.value}</Fragment>
          )
        )}
      </Fragment>
    );
  });
}
