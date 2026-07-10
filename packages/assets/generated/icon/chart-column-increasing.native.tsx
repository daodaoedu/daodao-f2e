import { SvgXml, type XmlProps } from "react-native-svg";

const xml = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M13 17V9M18 17V5M3 3V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H21M8 17V14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </svg>`;

export default function ChartColumnIncreasingSvg(props: Omit<XmlProps, "xml">) {
  return <SvgXml xml={xml} {...props} />;
}
