import { useRef } from "react";
import { CustomLink } from "@/shared/ui/custom-link";
import CheckLink from "./CheckLink";

export default function TextWithLinks({ children }) {
  const checkLinkRef = useRef(null);
  const urlRegex = /(https:\/\/[^\s]+)/g;
  const text = typeof children === "string" ? children : "";

  const parts = text.split(urlRegex).map((part) => {
    if (!urlRegex.test(part)) return part;

    try {
      const link = new URL(part);
      const href = decodeURI(link.href);

      if (window.location.hostname === href.hostname) {
        return (
          <CustomLink key={href} href={href} target="_blank">
            {href}
          </CustomLink>
        );
      }

      return (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            checkLinkRef.current?.check(href);
          }}
        >
          {href}
        </a>
      );
    } catch {
      return part;
    }
  });

  return (
    <p className="[&>a]:text-[#1a73e8]">
      {parts}
      <CheckLink ref={checkLinkRef} />
    </p>
  );
}
