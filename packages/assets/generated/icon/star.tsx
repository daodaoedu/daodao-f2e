import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const StarSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function StarSvg(props, ref) {
    return (
      <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <path d="M3.06 16.5L4.92 10.42L0 6.9H6.08L8 0.5L9.92 6.9H16L11.08 10.42L12.94 16.5L8 12.74L3.06 16.5Z" fill="currentColor"/>
      </svg>
    );
  }
);

export default StarSvg;
export type { SvgComponentProps };
