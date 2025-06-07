import { Product } from 'schema-dts';
import { JsonLdBuilder } from './JsonLdBuilder';

export type ReviewData = {
  reviewRating?: {
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
  author?: string;
  reviewBody?: string;
};

export class ProductBuilder extends JsonLdBuilder<Product> {
  protected setType(): void {
    this.data['@type'] = 'Product';
  }

  setBrand(type: 'Brand' | 'Organization', brand: string): this {
    this.data.brand = { '@type': type, name: brand };
    return this;
  }

  setOffers(
    type: 'Offer' | 'AggregateOffer',
    offers: {
      price?: number;
      priceCurrency?: string;
    }
  ): this {
    this.data.offers = { '@type': type, ...offers };
    return this;
  }

  addReview(reviews: ReviewData[]): this {
    this.data.review = reviews.map((review) => ({
      '@type': 'Review',
      ...review,
      reviewRating: review.reviewRating && {
        '@type': 'Rating',
        ...review.reviewRating,
      },
    }));
    return this;
  }

  setAggregateRating(rating: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount?: number;
    bestRating?: number;
    worstRating?: number;
  }): this {
    this.data.aggregateRating = rating;
    return this;
  }
}
