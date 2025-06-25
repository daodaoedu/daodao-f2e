import RoleDPng from "@/public/assets/daodao-test/role-d.png";
import RoleAPng from "@/public/assets/daodao-test/role-a.png";
import RoleCPng from "@/public/assets/daodao-test/role-c.png";
import RoleLPng from "@/public/assets/daodao-test/role-l.png";
import RoleOPng from "@/public/assets/daodao-test/role-o.png";
import DeepExplorerSvg from "@/public/assets/daodao-test/deep-explorer.svg";
import ActiveShaperSvg from "@/public/assets/daodao-test/active-shaper.svg";
import CommunityConnectorSvg from "@/public/assets/daodao-test/community-connector.svg";
import LiquidIntegratorSvg from "@/public/assets/daodao-test/liquid-integrator.svg";
import OrderBuilderSvg from "@/public/assets/daodao-test/order-builder.svg";

export type AnalysisType = {
  D: number;
  A: number;
  O: number;
  L: number;
  C: number;
};

export type ThemeType = {
  id: string;
  title: string;
  backgroundColor: `#${string}`;
  color: `#${string}`;
  secondaryColor: `#${string}`;
  largeImg: string;
  smallImg: React.FC;
  analysis: AnalysisType;
};

const deepExplorer: ThemeType = {
  id: "d",
  title: "探探島",
  backgroundColor: "#E9F3F5",
  color: "#48809A",
  secondaryColor: "#99ECFF",
  largeImg: RoleDPng.src,
  smallImg: DeepExplorerSvg,
  analysis: {
    D: 3.7,
    A: 2.4,
    O: 1.3,
    L: 2.6,
    C: 2.2,
  },
};

const activeShaper: ThemeType = {
  id: "a",
  title: "動動島",
  backgroundColor: "#F5F0E9",
  color: "#9A6948",
  secondaryColor: "#FFA10B",
  largeImg: RoleAPng.src,
  smallImg: ActiveShaperSvg,
  analysis: {
    D: 2.5,
    A: 3.7,
    O: 2.6,
    L: 1.2,
    C: 2.1,
  },
};

const orderBuilder: ThemeType = {
  id: "o",
  title: "構構島",
  backgroundColor: "#E9F5EE",
  color: "#489A95",
  secondaryColor: "#16B9B3",
  largeImg: RoleOPng.src,
  smallImg: OrderBuilderSvg,
  analysis: {
    D: 1.2,
    A: 1.5,
    O: 5.1,
    L: 2.4,
    C: 2.4,
  },
};

const liquidIntegrator: ThemeType = {
  id: "l",
  title: "跨跨島",
  backgroundColor: "#F5EDE9",
  color: "#CB6738",
  secondaryColor: "#FF6E0B",
  largeImg: RoleLPng.src,
  smallImg: LiquidIntegratorSvg,
  analysis: {
    D: 1.4,
    A: 2.2,
    O: 2.4,
    L: 3.5,
    C: 2.4,
  },
};

const communityConnector: ThemeType = {
  id: "c",
  title: "連連島",
  backgroundColor: "#F5F4E9",
  color: "#9D8242",
  secondaryColor: "#F9E41C",
  largeImg: RoleCPng.src,
  smallImg: CommunityConnectorSvg,
  analysis: {
    D: 1.8,
    A: 3.3,
    O: 1.4,
    L: 2.1,
    C: 3.5,
  },
};

export const themeMap = new Map<string, ThemeType>([
  [deepExplorer.id, deepExplorer],
  [activeShaper.id, activeShaper],
  [orderBuilder.id, orderBuilder],
  [liquidIntegrator.id, liquidIntegrator],
  [communityConnector.id, communityConnector],
]);
