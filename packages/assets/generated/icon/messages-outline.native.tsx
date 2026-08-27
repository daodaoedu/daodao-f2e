import { SvgXml, type XmlProps } from "react-native-svg";

const xml = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`;

export default function MessagesOutlineSvg(props: Omit<XmlProps, "xml">) {
  return <SvgXml xml={xml} {...props} />;
}
