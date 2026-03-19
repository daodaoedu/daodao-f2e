import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const VectorHalfBlueSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function VectorHalfBlueSvg(props, ref) {
    return (
      <svg width="86" height="31" viewBox="0 0 86 31" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <path d="M42.9502 0C30.095 0 8.00301 7.99821 0.122842 28.327C-0.325803 29.4839 0.508361 30.7336 1.74944 30.7336H84.151C85.392 30.7336 86.2262 29.4839 85.7776 28.327C77.8974 7.99821 55.8054 0 42.9502 0Z" fill="#99ECFF"/>
      </svg>
    );
  }
);

export default VectorHalfBlueSvg;
export type { SvgComponentProps };
