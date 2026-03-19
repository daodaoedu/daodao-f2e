import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const IslandMobileSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function IslandMobileSvg(props, ref) {
    return (
      <svg width="236" height="48" viewBox="0 0 236 48" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <path d="M67 0C46.9466 0 12.4843 12.4917 0.191627 44.2414C-0.508235 46.0483 0.793016 48 2.72904 48H131.271C133.207 48 134.508 46.0483 133.808 44.2414C121.516 12.4917 87.0534 0 67 0Z" fill="#16B9B3"/>
<path d="M169 0C148.947 0 114.484 12.4917 102.192 44.2414C101.492 46.0483 102.793 48 104.729 48H233.271C235.207 48 236.508 46.0483 235.808 44.2414C223.516 12.4917 189.053 0 169 0Z" fill="#99ECFF"/>
      </svg>
    );
  }
);

export default IslandMobileSvg;
export type { SvgComponentProps };
