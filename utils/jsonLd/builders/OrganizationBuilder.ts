import { Organization } from 'schema-dts';
import { JsonLdBuilder } from './JsonLdBuilder';

export class OrganizationBuilder extends JsonLdBuilder<Organization> {
  protected setType(): void {
    this.data['@type'] = 'Organization';
  }

  setLogo(logo: string): this {
    this.data.logo = logo;
    return this;
  }

  setSameAs(urls: string[]): this {
    this.data.sameAs = urls;
    return this;
  }

  setAddress(address: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  }): this {
    this.data.address = { '@type': 'PostalAddress', ...address };
    return this;
  }

  setContactPoint(
    contactPoints: {
      telephone?: string;
      email?: string;
      contactType?: string;
    }[]
  ): this {
    this.data.contactPoint = contactPoints.map((contactPoint) => ({
      '@type': 'ContactPoint',
      ...contactPoint,
    }));
    return this;
  }
}
