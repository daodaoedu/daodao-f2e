import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const ShareSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function ShareSvg(props, ref) {
    return (
      <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <mask id="mask0_1263_5754" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="15" height="16">
<rect y="0.5" width="15" height="15" fill="#D9D9D9"/>
</mask>
<g mask="url(#mask0_1263_5754)">
<path d="M3.31734 13.3125C3.00161 13.3125 2.73438 13.2031 2.51563 12.9844C2.29688 12.7656 2.1875 12.4984 2.1875 12.1827V3.81734C2.1875 3.50161 2.29688 3.23438 2.51563 3.01563C2.73438 2.79688 3.00161 2.6875 3.31734 2.6875H7.25953V3.625H3.31734C3.26922 3.625 3.22516 3.64505 3.18516 3.68516C3.14505 3.72516 3.125 3.76922 3.125 3.81734V12.1827C3.125 12.2308 3.14505 12.2748 3.18516 12.3148C3.22516 12.3549 3.26922 12.375 3.31734 12.375H11.6827C11.7308 12.375 11.7748 12.3549 11.8148 12.3148C11.8549 12.2748 11.875 12.2308 11.875 12.1827V8.24047H12.8125V12.1827C12.8125 12.4984 12.7031 12.7656 12.4844 12.9844C12.2656 13.2031 11.9984 13.3125 11.6827 13.3125H3.31734ZM6.07453 10.0841L5.41594 9.42547L11.2164 3.625H8.75V2.6875H12.8125V6.75H11.875V4.28359L6.07453 10.0841Z" fill="#16B9B3"/>
</g>
      </svg>
    );
  }
);

export default ShareSvg;
export type { SvgComponentProps };
