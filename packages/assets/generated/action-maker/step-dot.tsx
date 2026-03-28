import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const StepDotSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function StepDotSvg(props, ref) {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <circle cx="14" cy="14" r="14" fill="url(#paint0_radial_103_1153)"/>
<defs>
<radialGradient id="paint0_radial_103_1153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(14 14) rotate(90) scale(14)">
<stop stopColor="white"/>
<stop offset="1" stopColor="white" stopOpacity="0"/>
</radialGradient>
</defs>
      </svg>
    );
  }
);

export default StepDotSvg;
export type { SvgComponentProps };
