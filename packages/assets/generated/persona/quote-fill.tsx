import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const QuoteFillSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function QuoteFillSvg(props, ref) {
    return (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <path d="M51.4667 16.8C54.1333 19.7334 55.7333 22.9334 55.7333 28.2667C55.7333 37.6 49.0667 45.8667 39.7333 50.1334L37.3333 46.6667C46.1333 41.8667 48 35.7334 48.5333 31.7334C47.2 32.5334 45.3333 32.8 43.4667 32.5334C38.6667 32 34.9333 28.2667 34.9333 23.2C34.9333 20.8 36 18.4 37.6 16.5334C39.4667 14.6667 41.6 13.8667 44.2667 13.8667C47.2 13.8667 49.8667 15.2 51.4667 16.8ZM24.8 16.8C27.4667 19.7334 29.0667 22.9334 29.0667 28.2667C29.0667 37.6 22.4 45.8667 13.0667 50.1334L10.6667 46.6667C19.4667 41.8667 21.3333 35.7334 21.8667 31.7334C20.5333 32.5334 18.6667 32.8 16.8 32.5334C12 32 8.26666 28 8.26666 23.2C8.26666 20.8 9.33333 18.4 10.9333 16.5334C12.8 14.6667 14.9333 13.8667 17.6 13.8667C20.5333 13.8667 23.2 15.2 24.8 16.8Z" fill="currentColor" />
      </svg>
    );
  }
);

export default QuoteFillSvg;
export type { SvgComponentProps };
