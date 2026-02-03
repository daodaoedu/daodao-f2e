import type { ResourceSchema } from "@/services/resources";
import getEnv from "@/shared/config/env";
import JsonLdFactory from "@/shared/lib/jsonLd";

const env = getEnv();

export default function createResourceJsonLd(result: ResourceSchema) {
  return JsonLdFactory.createCourseBuilder()
    .setId(`${env.siteUrl}/resource/${result.id}`)
    .setName(result.name)
    .setDescription(result.description)
    .setUrl(`${env.siteUrl}/resource/${result.id}`)
    .setImage(result.imageUrl ?? "")
    .setEducationalLevel(result.level.split(",").map((age) => age.trim()))
    .setEducationalUse(result.majorCategory.split(",").map((cat) => cat.trim()))
    .setProvider("Person", result.user.name ?? "島島阿學")
    .setOffers({
      category: result.cost ?? "",
      price: result.cost ?? "",
      priceCurrency: "TWD",
    })
    .setHasCourseInstance({
      courseMode: "Online",
      courseWorkload: "PT30M",
    })
    .build();
}
