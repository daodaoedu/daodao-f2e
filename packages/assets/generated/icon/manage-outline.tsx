import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const ManageOutlineSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function ManageOutlineSvg(props, ref) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <path d="M4 20a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/>
      </svg>
    );
  }
);

export default ManageOutlineSvg;
export type { SvgComponentProps };
