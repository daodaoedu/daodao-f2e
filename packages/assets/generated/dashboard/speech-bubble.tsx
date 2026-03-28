import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const SpeechBubbleSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function SpeechBubbleSvg(props, ref) {
    return (
      <svg width="260" height="175" viewBox="0 0 260 175" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <path d="M193.53 0C230.215 4.05998e-06 259.999 29.8999 259.999 66.7295C259.999 103.558 230.215 133.457 193.53 133.457H108.513C108.335 133.726 108.12 133.983 107.863 134.221C96.0973 145.105 73.7555 165.774 65.2812 173.615C64.695 174.159 63.844 174.302 63.1084 173.979C62.3845 173.658 61.9025 172.932 61.9023 172.131V133.3C27.3436 130.941 8.38303e-05 102.017 0 66.7295C0 29.9 29.7829 0.000263456 66.4678 0H193.53Z" fill="#FFA10B"/>
      </svg>
    );
  }
);

export default SpeechBubbleSvg;
export type { SvgComponentProps };
