import JsonLdFactory from '@/shared/lib/jsonLd';
import { CircleSchema } from '@/services/circles';

export function createCircleJsonLd(result: CircleSchema) {
  return JsonLdFactory.createEventBuilder()
    .setId(`https://www.daoedu.tw/circles/${result._id}`)
    .setName(result.title)
    .setDescription(result.content)
    .setUrl(`https://www.daoedu.tw/circles/${result._id}`)
    .setImage(result.photoURL)
    .setLocation(result.area)
    .setStartDate(result.createdDate)
    .setEndDate(result.deadline ?? '')
    .build();
}
