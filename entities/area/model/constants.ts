import { TranslationKeys } from '@/shared/config/i18n';

interface AreaOption {
  value: string;
  label: TranslationKeys;
}

export const AREA_OPTIONS: AreaOption[] = [
  { value: 'taipei_city', label: 'area.taipei_city' },
  { value: 'new_taipei_city', label: 'area.new_taipei_city' },
  { value: 'keelung_city', label: 'area.keelung_city' },
  { value: 'taoyuan_city', label: 'area.taoyuan_city' },
  { value: 'hsinchu_city', label: 'area.hsinchu_city' },
  { value: 'hsinchu_county', label: 'area.hsinchu_county' },
  { value: 'miaoli_county', label: 'area.miaoli_county' },
  { value: 'taichung_city', label: 'area.taichung_city' },
  { value: 'nantou_county', label: 'area.nantou_county' },
  { value: 'changhua_county', label: 'area.changhua_county' },
  { value: 'yunlin_county', label: 'area.yunlin_county' },
  { value: 'chiayi_city', label: 'area.chiayi_city' },
  { value: 'chiayi_county', label: 'area.chiayi_county' },
  { value: 'tainan_city', label: 'area.tainan_city' },
  { value: 'kaohsiung_city', label: 'area.kaohsiung_city' },
  { value: 'pingtung_county', label: 'area.pingtung_county' },
  { value: 'taitung_county', label: 'area.taitung_county' },
  { value: 'hualien_county', label: 'area.hualien_county' },
  { value: 'yilan_county', label: 'area.yilan_county' },
  { value: 'penghu_county', label: 'area.penghu_county' },
  { value: 'kinmen_county', label: 'area.kinmen_county' },
  { value: 'lienchiang_county', label: 'area.lienchiang_county' },
];

export type AreaValue = (typeof AREA_OPTIONS)[number]['value'];
