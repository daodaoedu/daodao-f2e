import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const EmberFlameSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function EmberFlameSvg(props, ref) {
    return (
      <svg width="48" height="49" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <path d="M24.4 47.2C14.2 47.2 7 39.7 7 30.4C7 24.2 10.3 19.5 14.6 15.3C18.1 11.9 20.4 7.6 20.9 3.6C21 2.6 22.2 2.2 22.9 2.9C29.5 9 32.1 14.6 30.4 21.2C33.2 20 35.2 17.5 36.1 13.8C36.3 12.9 37.5 12.6 38.1 13.3C42.2 18.1 44 23.7 44 30C44 40.4 35.7 47.2 24.4 47.2Z" fill="#FFA10B"/>
<path d="M24.9 45.2C17.8 45.2 12.8 39.9 12.8 33.2C12.8 28.8 15.2 25.3 18.1 22.3C20.9 19.4 22.8 16.1 23.1 12.9C23.2 12.1 24.1 11.8 24.7 12.4C29.4 17.1 31.3 21.5 29.7 26.6C31.8 25.9 33.4 24 34.1 21.1C34.3 20.4 35.2 20.2 35.7 20.8C38.8 24.3 40.2 28.4 40.2 33.1C40.2 40.4 34.3 45.2 24.9 45.2Z" fill="#FF6E0A"/>
<path d="M24.5 45.8C19.2 45.8 15.4 41.8 15.4 36.7C15.4 33.2 17.4 30.7 19.7 28.4C21.7 26.4 23.1 24.1 23.4 21.4C23.5 20.6 24.5 20.3 25 20.9C28.6 24.9 30 28.3 28.7 32.4C30.4 31.8 31.5 30.3 32.1 28C32.3 27.3 33.1 27.1 33.6 27.7C35.7 30.3 36.7 33.3 36.7 36.7C36.7 42.2 32.3 45.8 24.5 45.8Z" fill="#FFD537"/>
<path d="M24.7 45.3C21.6 45.3 19.4 42.9 19.4 39.7C19.4 37.5 20.6 36 22 34.6C23.3 33.3 24.1 31.9 24.3 30.1C24.4 29.5 25.1 29.3 25.5 29.7C27.7 32.2 28.4 34.3 27.6 36.9C28.7 36.4 29.4 35.5 29.8 34.1C30 33.5 30.7 33.4 31.1 33.9C32.3 35.5 32.9 37.3 32.9 39.4C32.9 43 30.1 45.3 24.7 45.3Z" fill="#FFF4A8"/>
      </svg>
    );
  }
);

export default EmberFlameSvg;
export type { SvgComponentProps };
