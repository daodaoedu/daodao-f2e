import type { BreadcrumbList } from "schema-dts";
import { JsonLdBuilder } from "./JsonLdBuilder";

export type BreadcrumbItem = {
  name: string;
  item?: `http${string}`;
};

export class BreadcrumbListBuilder extends JsonLdBuilder<BreadcrumbList> {
  protected setType(): void {
    this.data["@type"] = "BreadcrumbList";
    this.data.itemListElement = [];
  }

  setItems(items: BreadcrumbItem[]): this {
    this.data.itemListElement = items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      ...item,
    }));
    return this;
  }
}
