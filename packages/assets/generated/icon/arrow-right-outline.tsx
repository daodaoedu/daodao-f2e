import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const ArrowRightOutlineSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function ArrowRightOutlineSvg(props, ref) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d="M8.51199 4.43C8.66307 4.3008 8.85926 4.23686 9.05746 4.25223C9.25566 4.26761 9.43965 4.36104 9.56899 4.512L15.569 11.512C15.6855 11.6479 15.7495 11.821 15.7495 12C15.7495 12.179 15.6855 12.3521 15.569 12.488L9.56899 19.488C9.43751 19.6316 9.25534 19.7184 9.06101 19.7301C8.86667 19.7418 8.67539 19.6775 8.52761 19.5508C8.37983 19.424 8.28712 19.2448 8.26909 19.0509C8.25106 18.8571 8.30912 18.6638 8.43099 18.512L14.012 12L8.43099 5.488C8.30154 5.33718 8.23726 5.14114 8.25226 4.94295C8.26726 4.74476 8.36032 4.56063 8.51099 4.431" fill="currentColor"/>
      </svg>
    );
  }
);

export default ArrowRightOutlineSvg;
export type { SvgComponentProps };
