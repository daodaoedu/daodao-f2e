import { WebSite } from 'schema-dts';
import { JsonLdBuilder } from './JsonLdBuilder';

export class WebSiteBuilder extends JsonLdBuilder<WebSite> {
  protected setType(): void {
    this.data['@type'] = 'WebSite';
  }

  setInLanguage(language: string): this {
    this.data.inLanguage = language;
    return this;
  }

  setPotentialAction(potentialAction: {
    '@type': 'SearchAction';
    'query-input'?: string;
    target: string;
  }): this {
    this.data.potentialAction = potentialAction;
    return this;
  }
}
