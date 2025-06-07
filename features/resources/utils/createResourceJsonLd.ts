import JsonLdFactory from '@/utils/jsonLd';
import { ResourceSchema } from '@/services/resources';

export default function createResourceJsonLd(result: ResourceSchema) {
  return JsonLdFactory.createCourseBuilder()
    .setId(`https://www.daoedu.tw/resource/${result.id}`)
    .setName(result.resourceName)
    .setDescription(result.description)
    .setUrl(`https://www.daoedu.tw/resource/${result.id}`)
    .setImage(result.resourceImgUrl ?? '')
    .setEducationalLevel(
      result.targetAudience.split(',').map((age) => age.trim())
    )
    .setEducationalUse(
      result.majorCategory.split(',').map((cat) => cat.trim())
    )
    .setProvider(
      'Person',
      result.user.name ?? '島島阿學'
    )
    .setOffers({
      category: result.cost ?? '',
      price: result.cost ?? '',
      priceCurrency: 'TWD',
    })
    .setHasCourseInstance({
      courseMode: 'Online',
      courseWorkload: 'PT30M',
    })
    .build();
}
