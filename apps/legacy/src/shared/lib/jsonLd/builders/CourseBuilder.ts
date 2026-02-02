import type { Course } from "schema-dts";
import { JsonLdBuilder } from "./JsonLdBuilder";

export class CourseBuilder extends JsonLdBuilder<Course> {
  protected setType(): void {
    this.data["@type"] = "Course";
  }

  setAuthor(author: { name: string; url?: string } | string): this {
    const authorObj = typeof author === "string" ? { name: author } : author;
    this.data.author = { "@type": "Person", ...authorObj };
    return this;
  }

  setProvider(type: "Person" | "Organization", provider: string): this {
    this.data.provider = { "@type": type, name: provider };
    return this;
  }

  setEducationalLevel(levels: string[] | undefined): this {
    this.data.educationalLevel = levels;
    return this;
  }

  setEducationalUse(uses: string[] | undefined): this {
    this.data.educationalUse = uses;
    return this;
  }

  setOffers(offers: { category?: string; price?: string | number; priceCurrency?: string }): this {
    this.data.offers = {
      "@type": "Offer",
      ...offers,
    };
    return this;
  }

  setHasCourseInstance(instance: { courseMode?: string; courseWorkload?: string }): this {
    this.data.hasCourseInstance = {
      "@type": "CourseInstance",
      ...instance,
    };
    return this;
  }
}
