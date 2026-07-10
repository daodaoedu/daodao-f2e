import { SvgXml, type XmlProps } from "react-native-svg";

const xml = `<svg viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M32.9357 10.5863H37.4337L27.6069 21.8176L39.1673 37.1009H30.1156L23.026 27.8317L14.9139 37.1009H10.4132L20.9239 25.0878L9.83398 10.5863H19.1155L25.5238 19.0587L32.9357 10.5863ZM31.3571 34.4087H33.8494L17.7612 13.1371H15.0866L31.3571 34.4087Z" fill="currentColor"/> </svg>`;

export default function XSvg(props: Omit<XmlProps, "xml">) {
  return <SvgXml xml={xml} {...props} />;
}
