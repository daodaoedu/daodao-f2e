import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const BgBlur2Svg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function BgBlur2Svg(props, ref) {
    return (
      <svg width="558" height="558" viewBox="0 0 558 558" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <g filter="url(#filter0_f_1933_2376)">
<circle cx="279" cy="279" r="99" fill="#DBF9FF"/>
</g>
<defs>
<filter id="filter0_f_1933_2376" x="0" y="0" width="558" height="558" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="90" result="effect1_foregroundBlur_1933_2376"/>
</filter>
</defs>
      </svg>
    );
  }
);

export default BgBlur2Svg;
export type { SvgComponentProps };
