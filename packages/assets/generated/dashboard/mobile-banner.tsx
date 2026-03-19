import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const MobileBannerSvg = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function MobileBannerSvg(props, ref) {
    return (
      <svg viewBox="0 0 390 420" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
        <g clipPath="url(#clip0_236_4899)" filter="url(#filter0_n_236_4899)">
<rect width="390" height="420" fill="url(#paint0_radial_236_4899)"/>
<path opacity="0.4" d="M20.0001 105C-3.94458 105 -45.0934 118.273 -59.7713 152.006C-60.6066 153.926 -59.0531 156 -56.7417 156H96.7419C99.0533 156 100.607 153.926 99.7712 152.006C85.0937 118.273 43.9448 105 20.0001 105Z" fill="#F9E41C"/>
<path opacity="0.7" d="M59.5 102.667L66.7633 92L66.4078 104.93L78.5132 100.598L70.6735 110.849L83 114.505L70.6735 118.151L78.5132 128.402L66.4078 124.07L66.7633 137L59.5 126.333L52.2367 137L52.5922 124.07L40.4868 128.402L48.3265 118.151L36 114.505L48.3265 110.849L40.4868 100.598L52.5922 104.93L52.2367 92L59.5 102.667Z" fill="white"/>
<path opacity="0.4" d="M335.951 53.9719C335.951 83.7787 360.15 107.944 390 107.944V0C360.15 0 335.951 24.1651 335.951 53.9719Z" fill="#16B9B3"/>
<path opacity="0.5" d="M281.569 54.0238C281.569 83.8306 305.768 108 335.618 108V0.0518494C305.768 0.0518494 281.569 24.217 281.569 54.0238Z" fill="white"/>
</g>
<defs>
<filter id="filter0_n_236_4899" x="0" y="0" width="390" height="420" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
<feFlood floodOpacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feTurbulence type="fractalNoise" baseFrequency="0.5 0.5" stitchTiles="stitch" numOctaves="3" result="noise" seed="812" />
<feComponentTransfer in="noise" result="coloredNoise1">
<feFuncR type="linear" slope="2" intercept="-0.5" />
<feFuncG type="linear" slope="2" intercept="-0.5" />
<feFuncB type="linear" slope="2" intercept="-0.5" />
<feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 "/>
</feComponentTransfer>
<feComposite operator="in" in2="shape" in="coloredNoise1" result="noise1Clipped" />
<feComponentTransfer in="noise1Clipped" result="color1">
<feFuncA type="table" tableValues="0 0.06" />
</feComponentTransfer>
<feMerge result="effect1_noise_236_4899">
<feMergeNode in="shape" />
<feMergeNode in="color1" />
</feMerge>
</filter>
<radialGradient id="paint0_radial_236_4899" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(195 7.87234e-06) rotate(90) scale(265.5 383.232)">
<stop stopColor="#5FDAD5"/>
<stop offset="1" stopColor="#E9FEFF"/>
</radialGradient>
<clipPath id="clip0_236_4899">
<rect width="390" height="420" fill="white"/>
</clipPath>
</defs>
      </svg>
    );
  }
);

export default MobileBannerSvg;
export type { SvgComponentProps };
