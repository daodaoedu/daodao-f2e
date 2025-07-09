import { Event } from "schema-dts";
import { JsonLdBuilder } from "./JsonLdBuilder";

export class EventBuilder extends JsonLdBuilder<Event> {
  protected setType(): void {
    this.data["@type"] = "Event";
  }

  setStartDate(startDate: string | Date): this {
    if (!startDate) return this;
    this.data.startDate =
      startDate instanceof Date ? startDate.toISOString() : startDate;
    return this;
  }

  setEndDate(endDate: string | Date): this {
    if (!endDate) return this;
    this.data.endDate =
      endDate instanceof Date ? endDate.toISOString() : endDate;
    return this;
  }

  setLocation(
    location:
      | {
          "@type": "Place" | "VirtualLocation";
          name?: string;
          address?: {
            "@type": "PostalAddress";
            streetAddress?: string;
            addressLocality?: string;
            addressRegion?: string;
            postalCode?: string;
            addressCountry?: string;
          };
          url?: string;
        }
      | string
  ): this {
    this.data.location =
      typeof location === "string"
        ? { "@type": "Place", name: location }
        : location;
    return this;
  }

  setPerformer(type: "Person" | "Organization", performer: string): this {
    this.data.performer = { "@type": type, name: performer };
    return this;
  }

  setOffers(offers: { price?: number; priceCurrency?: string }): this {
    this.data.offers = {
      "@type": "Offer",
      ...offers,
    };
    return this;
  }
}
