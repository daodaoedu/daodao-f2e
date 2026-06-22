import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const ArrowCircleSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function ArrowCircleSvg(props, ref) {
    return (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <circle cx="30" cy="30" r="30" fill="#F0FAFA" />
  <path d="M42.0735 30.0176L30.4666 30.0194M30.45 30.0194L17.85 30.0194M30.45 17.4L41.3791 28.3296C41.8221 28.7727 42.071 29.3735 42.071 30C42.071 30.6265 41.8221 31.2274 41.3791 31.6704L30.45 42.6" stroke="#5C7080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
);

export default ArrowCircleSvg;
export type { SvgComponentProps };
