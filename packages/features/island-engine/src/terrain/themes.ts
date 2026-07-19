/**
 * 五套人格地形主題 ＋ 中性預設
 *
 * 配色源自 quiz 人格主題（packages/features/quiz theme-map）與品牌色盤
 * （packages/design-tokens colors）——風格護欄：低面數、圓潤、品牌色、無寫實貼圖。
 * 各主題的生成參數刻意彼此相異（驗收：五主題參數各異）。
 */

import { PersonaType, type PersonaTypeType } from "../types";

export interface ITerrainTheme {
  key: PersonaTypeType | "neutral";
  /** 島名（quiz 主題命名） */
  name: string;
  sky: string;
  fog: string;
  water: string;
  sand: string;
  grass: string;
  cliff: string;
  /** 主題強調色（quiz secondaryColor），供環境物件/氛圍粒子使用 */
  accent: string;
  /** 島半徑（world units） */
  islandRadius: number;
  /** 丘陵起伏振幅（world units） */
  hillAmplitude: number;
  /** 地形噪聲頻率（值越大起伏越碎） */
  noiseFrequency: number;
  /** 海岸線不規則度 0..1（值越大島形越蜿蜒） */
  coastRoughness: number;
  /** 植被密度 0..1（環境裝飾物件的基準密度） */
  vegetationDensity: number;
}

const THEME_LIST: ITerrainTheme[] = [
  {
    key: PersonaType.D,
    name: "探探島",
    sky: "#E9F3F5",
    fog: "#E9F3F5",
    water: "#99ECFF",
    sand: "#F2E8D5",
    grass: "#8FD0C4",
    cliff: "#48809A",
    accent: "#99ECFF",
    islandRadius: 62,
    hillAmplitude: 1.5,
    noiseFrequency: 2.2,
    coastRoughness: 0.55,
    vegetationDensity: 0.5,
  },
  {
    key: PersonaType.A,
    name: "動動島",
    sky: "#F5F0E9",
    fog: "#F5F0E9",
    water: "#8FDCE5",
    sand: "#F5DFB8",
    grass: "#B7CE7E",
    cliff: "#9A6948",
    accent: "#FFA10B",
    islandRadius: 58,
    hillAmplitude: 1.9,
    noiseFrequency: 3,
    coastRoughness: 0.7,
    vegetationDensity: 0.35,
  },
  {
    key: PersonaType.O,
    name: "構構島",
    sky: "#E9F5EE",
    fog: "#E9F5EE",
    water: "#89DAD7",
    sand: "#EFE6CC",
    grass: "#79C99E",
    cliff: "#489A95",
    accent: "#16B9B3",
    islandRadius: 66,
    hillAmplitude: 1.1,
    noiseFrequency: 1.6,
    coastRoughness: 0.3,
    vegetationDensity: 0.6,
  },
  {
    key: PersonaType.L,
    name: "跨跨島",
    sky: "#F5EDE9",
    fog: "#F5EDE9",
    water: "#93D6E8",
    sand: "#F3D9BD",
    grass: "#C4B96F",
    cliff: "#CB6738",
    accent: "#FF6E0B",
    islandRadius: 62,
    hillAmplitude: 1.7,
    noiseFrequency: 2.6,
    coastRoughness: 0.8,
    vegetationDensity: 0.45,
  },
  {
    key: PersonaType.C,
    name: "連連島",
    sky: "#F5F4E9",
    fog: "#F5F4E9",
    water: "#A9EDE8",
    sand: "#F4E9C4",
    grass: "#A5CF8B",
    cliff: "#9D8242",
    accent: "#F9E41C",
    islandRadius: 60,
    hillAmplitude: 1.3,
    noiseFrequency: 2,
    coastRoughness: 0.45,
    vegetationDensity: 0.7,
  },
];

/** 未完成 quiz 的中性預設島（品牌主色系） */
export const NEUTRAL_THEME: ITerrainTheme = {
  key: "neutral",
  name: "無名小島",
  sky: "#F3FCFC",
  fog: "#F3FCFC",
  water: "#A9EDE8",
  sand: "#F0E9D8",
  grass: "#89DAD7",
  cliff: "#295E5C",
  accent: "#16B9B3",
  islandRadius: 62,
  hillAmplitude: 1.4,
  noiseFrequency: 2,
  coastRoughness: 0.5,
  vegetationDensity: 0.4,
};

export const TERRAIN_THEMES: ReadonlyMap<string, ITerrainTheme> = new Map(
  THEME_LIST.map((theme) => [theme.key, theme])
);

/**
 * 取得人格對應的地形主題；未完成 quiz（null）或未知代碼回傳中性預設
 */
export const getTerrainTheme = (personaType: string | null): ITerrainTheme =>
  (personaType && TERRAIN_THEMES.get(personaType.toUpperCase())) || NEUTRAL_THEME;
