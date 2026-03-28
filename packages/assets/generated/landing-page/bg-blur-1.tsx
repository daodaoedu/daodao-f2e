import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const BgBlur1Svg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function BgBlur1Svg(props, ref) {
    return (
      <svg width="837" height="831" viewBox="0 0 837 831" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <g filter="url(#filter0_f_1933_2370)">
<ellipse cx="119.935" cy="119.96" rx="119.935" ry="119.96" transform="matrix(-0.813137 0.582073 0.581483 0.813559 554.49 132.597)" fill="#FFF0C8"/>
</g>
<g filter="url(#filter1_f_1933_2370)">
<ellipse cx="98.9462" cy="98.9672" rx="98.9462" ry="98.9672" transform="matrix(-0.813166 0.582031 0.581524 0.813529 343.249 210.033)" fill="#C8FFF2"/>
</g>
<g filter="url(#filter2_f_1933_2370)">
<rect width="195.893" height="196.935" transform="matrix(-0.813166 0.582031 0.581524 0.813529 339.294 376.368)" fill="#C8DEFF"/>
</g>
<defs>
<filter id="filter0_f_1933_2370" x="226.81" y="0" width="599.823" height="600.004" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="90" result="effect1_foregroundBlur_1933_2370"/>
</filter>
<filter id="filter1_f_1933_2370" x="41.4097" y="69.1387" width="557.863" height="557.994" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="90" result="effect1_foregroundBlur_1933_2370"/>
</filter>
<filter id="filter2_f_1933_2370" x="0" y="196.368" width="633.816" height="634.228" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="90" result="effect1_foregroundBlur_1933_2370"/>
</filter>
</defs>
      </svg>
    );
  }
);

export default BgBlur1Svg;
export type { SvgComponentProps };
