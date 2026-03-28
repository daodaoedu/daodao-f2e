import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const VectorSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function VectorSvg(props, ref) {
    return (
      <svg width="217" height="111" viewBox="0 0 217 111" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <path d="M67.0002 0C22.1039 0 -55.0502 28.8873 -82.5713 102.308C-84.1374 106.487 -81.2246 111 -76.8907 111H210.891C215.225 111 218.138 106.487 216.571 102.308C189.051 28.8873 111.896 0 67.0002 0Z" fill="#F9E41C"/>
      </svg>
    );
  }
);

export default VectorSvg;
export type { SvgComponentProps };
