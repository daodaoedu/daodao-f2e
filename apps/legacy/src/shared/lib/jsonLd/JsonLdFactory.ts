import type { Graph, Thing } from "schema-dts";
import { ArticleBuilder } from "./builders/ArticleBuilder";
import { BreadcrumbListBuilder } from "./builders/BreadcrumbListBuilder";
import { CourseBuilder } from "./builders/CourseBuilder";
import { EventBuilder } from "./builders/EventBuilder";
import { FAQPageBuilder } from "./builders/FAQPageBuilder";
import { ItemListBuilder } from "./builders/ItemListBuilder";
import type { JsonLdBuilder } from "./builders/JsonLdBuilder";
import { OrganizationBuilder } from "./builders/OrganizationBuilder";
import { PersonBuilder } from "./builders/PersonBuilder";
import { ProductBuilder } from "./builders/ProductBuilder";

export class JsonLdFactory {
  static createArticleBuilder(): ArticleBuilder {
    return new ArticleBuilder();
  }

  static createCourseBuilder(): CourseBuilder {
    return new CourseBuilder();
  }

  static createOrganizationBuilder(): OrganizationBuilder {
    return new OrganizationBuilder();
  }

  static createEventBuilder(): EventBuilder {
    return new EventBuilder();
  }

  static createBreadcrumbListBuilder(): BreadcrumbListBuilder {
    return new BreadcrumbListBuilder();
  }

  static createProductBuilder(): ProductBuilder {
    return new ProductBuilder();
  }

  static createPersonBuilder(): PersonBuilder {
    return new PersonBuilder();
  }

  static createFAQPageBuilder(): FAQPageBuilder {
    return new FAQPageBuilder();
  }

  static createItemListBuilder(): ItemListBuilder {
    return new ItemListBuilder();
  }

  static createGraph(items: JsonLdBuilder<Thing>[]): Graph {
    return {
      "@context": "https://schema.org",
      "@graph": items.map((item) => item.buildWithoutContext()),
    };
  }
}

export default JsonLdFactory;
