import { SearchResultsPage, Thing } from 'schema-dts';
import { JsonLdBuilder } from './JsonLdBuilder';
import { BreadcrumbItem, BreadcrumbListBuilder } from './BreadcrumbListBuilder';

export class SearchResultsPageBuilder extends JsonLdBuilder<SearchResultsPage> {
  protected setType(): void {
    this.data['@type'] = 'SearchResultsPage';
  }

  private getKeywordsElement(): string[] {
    const keywords: string[] = Array.isArray(this.data.keywords)
      ? this.data.keywords
      : [];
    if (!Array.isArray(this.data.keywords)) {
      this.data.keywords = keywords;
    }
    return keywords;
  }

  setAbout(about: string): this {
    this.data.about = about;
    return this;
  }

  setLastReviewed(lastReviewed: string | Date): this {
    this.data.lastReviewed =
      typeof lastReviewed === 'string'
        ? lastReviewed
        : lastReviewed.toISOString();
    return this;
  }

  setBreadcrumb(breadcrumb: BreadcrumbItem[]): this {
    this.data.breadcrumb = new BreadcrumbListBuilder()
      .setItems(breadcrumb)
      .buildWithoutContext();
    return this;
  }

  setMainEntity(mainEntity: Thing): this {
    this.data.mainEntity = mainEntity;
    return this;
  }

  setInLanguage(inLanguage: string): this {
    this.data.inLanguage = inLanguage;
    return this;
  }

  addKeyword(...keywords: string[]): this {
    this.getKeywordsElement().push(...keywords);
    return this;
  }

  setSearchQuery(query: string): this {
    this.data.mainContentOfPage = {
      '@type': 'WebPageElement',
      isPartOf: {
        '@id': this.data['@id'] || '',
      },
      about: {
        '@type': 'Thing',
        name: query,
      },
    };
    return this;
  }
}
