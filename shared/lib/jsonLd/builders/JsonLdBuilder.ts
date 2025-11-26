import { Thing, WithContext } from 'schema-dts';

type ImageObject =
  | string
  | string[]
  | { '@type': 'ImageObject'; url: string; width?: number; height?: number };

abstract class JsonLdBuilder<T extends Thing> {
  protected data: T & Record<string, unknown> = {} as T & Record<string, unknown>;

  protected context = 'https://schema.org';

  constructor() {
    this.setType();
  }

  protected abstract setType(): void;

  setId(id: string | undefined): this {
    this.data['@id'] = id;
    return this;
  }

  setName(name: string): this {
    this.data.name = name;
    return this;
  }

  setDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  setUrl(url: string): this {
    this.data.url = url;
    return this;
  }

  setImage(image: ImageObject): this {
    this.data.image = image;
    return this;
  }

  addProperty(key: string, value: unknown): this {
    this.data[key] = value;
    return this;
  }

  build(): WithContext<T> {
    return {
      '@context': this.context,
      ...this.data as Record<string, unknown>,
    } as WithContext<T>;
  }

  buildWithoutContext(): T {
    return this.data as T;
  }

  reset(): this {
    this.data = {} as T & Record<string, unknown>;
    this.setType();
    return this;
  }
}

export { JsonLdBuilder };
