import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const IslandSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function IslandSvg(props, ref) {
    return (
      <svg width="414" height="75" viewBox="0 0 414 75" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <path d="M338.554 20.4893C321.061 20.4893 290.999 31.2921 280.276 58.7495C279.665 60.3121 280.8 62 282.489 62H394.62C396.309 62 397.444 60.3121 396.833 58.7495C386.11 31.2921 356.047 20.4893 338.554 20.4893Z" fill="#16B9B3"/>
<path d="M234.18 8C223.65 8 205.555 14.5025 199.101 31.0297C198.733 31.9703 199.416 32.9862 200.433 32.9862H267.927C268.943 32.9862 269.627 31.9703 269.259 31.0297C262.805 14.5025 244.709 8 234.18 8Z" fill="#F9E41C"/>
      </svg>
    );
  }
);

export default IslandSvg;
export type { SvgComponentProps };
