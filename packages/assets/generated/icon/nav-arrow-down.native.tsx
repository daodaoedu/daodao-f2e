import { SvgXml, type XmlProps } from "react-native-svg";

const xml = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path d="M6 9L12 15L18 9" stroke="#011416" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </svg>`;

export default function NavArrowDownSvg(props: Omit<XmlProps, "xml">) {
  return <SvgXml xml={xml} {...props} />;
}
