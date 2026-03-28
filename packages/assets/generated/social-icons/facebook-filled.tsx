import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const FacebookFilledSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function FacebookFilledSvg(props, ref) {
    return (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <g clipPath="url(#clip0_1799_4367)">
<path d="M30.9824 0C35.9626 0 40 4.03735 40 9.01758V30.9824C40 35.9626 35.9626 40 30.9824 40H9.01758C4.03735 40 0 35.9626 0 30.9824V9.01758C0 4.03735 4.03735 0 9.01758 0H30.9824Z" fill="#1877F2"/>
<path d="M27.7852 25.7812L28.6719 20H23.125V16.2484C23.125 14.6666 23.8998 13.125 26.3844 13.125H28.9062V8.20312C28.9062 8.20312 26.6175 7.8125 24.4292 7.8125C19.8609 7.8125 16.875 10.5813 16.875 15.5938V20H11.7969V25.7812H16.875V39.757C17.9088 39.919 18.9536 40.0002 20 40C21.0464 40.0002 22.0912 39.919 23.125 39.757V25.7812H27.7852Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_1799_4367">
<rect width="40" height="40" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

export default FacebookFilledSvg;
export type { SvgComponentProps };
