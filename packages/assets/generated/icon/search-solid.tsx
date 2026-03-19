import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const SearchSolidSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function SearchSolidSvg(props, ref) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <path d="M10 1.25C14.8325 1.25 18.75 5.16751 18.75 10C18.75 12.1462 17.9757 14.1106 16.6934 15.6328L22.5303 21.4697C22.8232 21.7626 22.8232 22.2374 22.5303 22.5303C22.2374 22.8232 21.7626 22.8232 21.4697 22.5303L15.6328 16.6934C14.1106 17.9757 12.1462 18.75 10 18.75C5.16751 18.75 1.25 14.8325 1.25 10C1.25 5.16751 5.16751 1.25 10 1.25ZM10 2.75C5.99594 2.75 2.75 5.99594 2.75 10C2.75 12.7185 4.24704 15.0862 6.46094 16.3271C4.95554 15.0432 4 13.1336 4 11C4 7.13401 7.13401 4 11 4C13.1336 4 15.0432 4.95554 16.3271 6.46094C15.0862 4.24704 12.7185 2.75 10 2.75Z" fill="currentColor"/>
      </svg>
    );
  }
);

export default SearchSolidSvg;
export type { SvgComponentProps };
