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
    if (!datePublished) return this;
    this.data.datePublished = datePublished instanceof Date
      ? datePublished.toISOString()
      : datePublished;
    return this;
  }

  setDateModified(dateModified: string | Date): this {
    if (!dateModified) return this;
    this.data.dateModified = dateModified instanceof Date
      ? dateModified.toISOString()
      : dateModified;
    return this;
  }
}
