import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const CircleSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function CircleSvg(props, ref) {
    return (
      <svg width="212" height="212" viewBox="0 0 212 212" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <circle cx="106" cy="106" r="106" fill="#16B9B3"/>
      </svg>
    );
  }
);

export default CircleSvg;
export type { SvgComponentProps };
