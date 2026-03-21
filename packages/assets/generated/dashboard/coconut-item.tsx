import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const CoconutItemSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function CoconutItemSvg(props, ref) {
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <defs>
    <radialGradient id="cig" cx="38%" cy="30%" r="68%" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="120" y2="120">
      <stop offset="0%" stopColor="#CFA06E"/>
      <stop offset="55%" stopColor="#9A6235"/>
      <stop offset="100%" stopColor="#5C3319"/>
    </radialGradient>
  </defs>
  
  <circle cx="60" cy="60" r="56" fill="url(#cig)"/>
  
  <path d="M18 50 Q42 33 60 31 Q78 33 102 50" stroke="#4A2810" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
  <path d="M14 63 Q40 48 60 46 Q80 48 106 63" stroke="#4A2810" strokeWidth="1.5" strokeLinecap="round" opacity="0.22"/>
  <path d="M17 76 Q40 63 60 61 Q80 63 103 76" stroke="#4A2810" strokeWidth="1.5" strokeLinecap="round" opacity="0.16"/>
  
  <circle cx="49" cy="56" r="5.5" fill="#1C0900"/>
  <circle cx="71" cy="56" r="5.5" fill="#1C0900"/>
  <circle cx="60" cy="71" r="5.5" fill="#1C0900"/>
      </svg>
    );
  }
);

export default CoconutItemSvg;
export type { SvgComponentProps };
