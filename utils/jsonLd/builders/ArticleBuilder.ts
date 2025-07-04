import { Article } from 'schema-dts';
import { JsonLdBuilder } from './JsonLdBuilder';

export class ArticleBuilder extends JsonLdBuilder<Article> {
  protected setType(): void {
    this.data['@type'] = 'Article';
  }

  setHeadline(headline: string): this {
    this.data.headline = headline;
    return this;
  }

  setAuthor(author: { name: string; url?: string } | string): this {
    const authorObj = typeof author === 'string' ? { name: author } : author;
    this.data.author = { '@type': 'Person', ...authorObj };
    return this;
  }

  setPublisher(type: 'Person' | 'Organization', publisher: string): this {
    this.data.publisher = { '@type': type, name: publisher };
    return this;
  }

  setDatePublished(datePublished: string | Date): this {
    this.data.datePublished =
      typeof datePublished === 'string'
        ? datePublished
        : datePublished.toISOString();
    return this;
  }

  setDateModified(dateModified: string | Date): this {
    this.data.dateModified =
      typeof dateModified === 'string'
        ? dateModified
        : dateModified.toISOString();
    return this;
  }
}
