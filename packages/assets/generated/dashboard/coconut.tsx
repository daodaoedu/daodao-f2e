import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const CoconutSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function CoconutSvg(props, ref) {
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <defs>
    <radialGradient id="csg" cx="38%" cy="30%" r="68%">
      <stop offset="0%" stopColor="#CFA06E"/>
      <stop offset="55%" stopColor="#9A6235"/>
      <stop offset="100%" stopColor="#5C3319"/>
    </radialGradient>
  </defs>
  
  <circle cx="50" cy="50" r="48" fill="#FFF8EE"/>
  
  <circle cx="50" cy="50" r="46" fill="none" stroke="#9A6235" strokeWidth="2.5" strokeDasharray="5 3"/>
  
  <circle cx="50" cy="50" r="40" fill="none" stroke="#9A6235" strokeWidth="1" strokeDasharray="3 4" opacity="0.55"/>
  
  <circle cx="50" cy="51" r="27" fill="url(#csg)"/>
  
  <path d="M27 46 Q38 32 50 30 Q62 32 73 46" stroke="#3D1A06" strokeWidth="1.5" strokeLinecap="round" opacity="0.35"/>
  <path d="M25 56 Q38 44 50 42 Q62 44 75 56" stroke="#3D1A06" strokeWidth="1" strokeLinecap="round" opacity="0.22"/>
  
  <circle cx="43" cy="52" r="4" fill="#1C0900"/>
  <circle cx="57" cy="52" r="4" fill="#1C0900"/>
  <circle cx="50" cy="63" r="4" fill="#1C0900"/>
      </svg>
    );
  }
);

export default CoconutSvg;
export type { SvgComponentProps };
