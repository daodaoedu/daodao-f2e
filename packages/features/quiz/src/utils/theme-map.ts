import ActiveShaperSvg from "@daodao/assets/images/quiz/active-shaper.svg";
import CommunityConnectorSvg from "@daodao/assets/images/quiz/community-connector.svg";
import DeepExplorerSvg from "@daodao/assets/images/quiz/deep-explorer.svg";
import LiquidIntegratorSvg from "@daodao/assets/images/quiz/liquid-integrator.svg";
import OrderBuilderSvg from "@daodao/assets/images/quiz/order-builder.svg";
import RoleAPng from "@daodao/assets/images/quiz/role-a.webp";
import RoleCPng from "@daodao/assets/images/quiz/role-c.webp";
import RoleDPng from "@daodao/assets/images/quiz/role-d.webp";
import RoleLPng from "@daodao/assets/images/quiz/role-l.webp";
import RoleOPng from "@daodao/assets/images/quiz/role-o.webp";
import type { ITheme } from "../types";

const themeList: ITheme[] = [
  {
    id: "D",
    title: "探探島",
    backgroundColor: "#E9F3F5",
    color: "#48809A",
    secondaryColor: "#99ECFF",
    largeImg: RoleDPng,
    smallImg: DeepExplorerSvg,
    analysis: {
      D: 3.7,
      A: 2.4,
      O: 1.3,
      L: 2.6,
      C: 2.2,
    },
  },

  {
    id: "A",
    title: "動動島",
    backgroundColor: "#F5F0E9",
    color: "#9A6948",
    secondaryColor: "#FFA10B",
    largeImg: RoleAPng,
    smallImg: ActiveShaperSvg,
    analysis: {
      D: 2.5,
      A: 3.7,
      O: 2.6,
      L: 1.2,
      C: 2.1,
    },
  },

  {
    id: "O",
    title: "構構島",
    backgroundColor: "#E9F5EE",
    color: "#489A95",
    secondaryColor: "#16B9B3",
    largeImg: RoleOPng,
    smallImg: OrderBuilderSvg,
    analysis: {
      D: 1.2,
      A: 1.5,
      O: 5.1,
      L: 2.4,
      C: 2.4,
    },
  },

  {
    id: "L",
    title: "跨跨島",
    backgroundColor: "#F5EDE9",
    color: "#CB6738",
    secondaryColor: "#FF6E0B",
    largeImg: RoleLPng,
    smallImg: LiquidIntegratorSvg,
    analysis: {
      D: 1.4,
      A: 2.2,
      O: 2.4,
      L: 3.5,
      C: 2.4,
    },
  },

  {
    id: "C",
    title: "連連島",
    backgroundColor: "#F5F4E9",
    color: "#9D8242",
    secondaryColor: "#F9E41C",
    largeImg: RoleCPng,
    smallImg: CommunityConnectorSvg,
    analysis: {
      D: 1.8,
      A: 3.3,
      O: 1.4,
      L: 2.1,
      C: 3.5,
    },
  },
];

export const themeMap = new Map<string, ITheme>(themeList.map((theme) => [theme.id, theme]));
