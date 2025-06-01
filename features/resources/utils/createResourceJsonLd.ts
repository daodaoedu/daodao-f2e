import JsonLdFactory from '@/utils/jsonLd';
import { NotionPageSchema } from '@/services/notion';

export default function createResourceJsonLd(result: NotionPageSchema) {
  return JsonLdFactory.createCourseBuilder()
    .setId(result.id)
    .setName(result.properties['資源名稱']?.title[0]?.plain_text ?? '')
    .setDescription(result.properties['介紹']?.rich_text[0]?.plain_text ?? '')
    .setUrl(`https://www.daoedu.tw/resource/${result.id}`)
    .setImage(result.properties['縮圖']?.files[0]?.external?.url ?? '')
    .setEducationalLevel(
      result.properties['年齡層']?.multi_select.map((age) => age.name)
    )
    .setEducationalUse(
      result.properties['領域名稱']?.multi_select.map((cat) => cat.name)
    )
    .setProvider(
      'Person',
      result.properties['創建者']?.multi_select[0]?.name ?? '島島阿學'
    )
    .setOffers({
      category: result.properties['費用']?.select?.name ?? '',
      price: result.properties['費用']?.select?.name ?? '',
      priceCurrency: 'TWD',
    })
    .setHasCourseInstance({
      courseMode: 'Online',
      courseWorkload: 'PT30M',
    })
    .build();
}
