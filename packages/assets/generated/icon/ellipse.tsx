import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const EllipseSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function EllipseSvg(props, ref) {
    return (
      <svg width="117" height="92" viewBox="0 0 117 92" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <circle cx="29.5528" cy="87.0217" r="87" transform="rotate(-15 29.5528 87.0217)" fill="#A9EDE8" fillOpacity="0.3"/>
      </svg>
    );
  }
);

export default EllipseSvg;
export type { SvgComponentProps };
