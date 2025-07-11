import JsonLdFactory from "@/utils/jsonLd";
import { CircleSchema } from "@/services/circle";

export function createCircleJsonLd(result: CircleSchema) {
  return JsonLdFactory.createEventBuilder()
    .setId(`https://www.daoedu.tw/group/${result._id}`)
    .setName(result.title)
    .setDescription(result.content)
    .setUrl(`https://www.daoedu.tw/group/${result._id}`)
    .setImage(result.photoURL ?? "")
    .setLocation(result.area?.join?.(" ") ?? "")
    .setStartDate(result.createdDate)
    .setEndDate(result.deadline)
    .build();
}
