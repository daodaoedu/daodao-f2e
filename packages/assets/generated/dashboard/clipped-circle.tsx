import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const ClippedCircleSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function ClippedCircleSvg(props, ref) {
    return (
      <svg width="212" height="211" viewBox="0 0 212 211" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <path d="M202.036 211H106C47.4583 211 0 163.766 0 105.5C0 47.2344 47.4583 0 106 0C164.542 0 212 47.2344 212 105.5V201.083C212 206.56 207.539 211 202.036 211Z" fill="#FF6E0B"/>
      </svg>
    );
  }
);

export default ClippedCircleSvg;
export type { SvgComponentProps };
