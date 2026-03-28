import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const NeutralSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function NeutralSvg(props, ref) {
    return (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <path d="M35.2622 48H12.7378C5.70301 48 0 42.2963 0 35.2614V12.7375C0 5.70259 5.70301 0 12.7378 0H35.2622C42.297 0 48 5.70259 48 12.7375V35.2614C48 42.2963 42.297 48 35.2622 48Z" fill="#DEDBFF"/>
<path d="M16.1348 24.3956C16.1348 26.271 15.2092 27.7914 14.0672 27.7914C12.9253 27.7914 12 26.271 12 24.3956C12 22.5204 12.9253 21 14.0672 21C15.2092 21 16.1348 22.5204 16.1348 24.3956Z" fill="#343332"/>
<path d="M36 24.3956C36 26.271 35.0744 27.7914 33.9325 27.7914C32.7905 27.7914 31.8652 26.271 31.8652 24.3956C31.8652 22.5204 32.7905 21 33.9325 21C35.0744 21 36 22.5204 36 24.3956Z" fill="#343332"/>
      </svg>
    );
  }
);

export default NeutralSvg;
export type { SvgComponentProps };
