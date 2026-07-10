import { SvgXml, type XmlProps } from "react-native-svg";

const xml = `<svg width="117" height="92" viewBox="0 0 117 92" fill="none" xmlns="http://www.w3.org/2000/svg"> <circle cx="29.5528" cy="87.0217" r="87" transform="rotate(-15 29.5528 87.0217)" fill="#A9EDE8" fill-opacity="0.3"/> </svg>`;

export default function EllipseSvg(props: Omit<XmlProps, "xml">) {
  return <SvgXml xml={xml} {...props} />;
}
