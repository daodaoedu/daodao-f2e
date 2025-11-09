import JsonLdFactory from '@/shared/lib/jsonLd';
import type { CircleData } from '@/entities/circle';

export function createCircleJsonLd(result: CircleData) {
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
