import { Person } from 'schema-dts';
import { JsonLdBuilder } from './JsonLdBuilder';

export class PersonBuilder extends JsonLdBuilder<Person> {
  protected setType(): void {
    this.data['@type'] = 'Person';
  }

  setJobTitle(jobTitle: string): this {
    this.data.jobTitle = jobTitle;
    return this;
  }

  setTelephone(telephone: string): this {
    this.data.telephone = telephone;
    return this;
  }

  setEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  setSameAs(urls: string[]): this {
    this.data.sameAs = urls;
    return this;
  }

  setBirthDate(birthDate: string | Date): this {
    if (!birthDate) return this;
    this.data.birthDate = birthDate instanceof Date
      ? birthDate.toISOString().split('T')[0]
      : birthDate;
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
}
