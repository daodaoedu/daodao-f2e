import { ItemList, ListItem } from 'schema-dts';
import { JsonLdBuilder } from './JsonLdBuilder';

export class ItemListBuilder extends JsonLdBuilder<ItemList> {
  protected setType(): void {
    this.data['@type'] = 'ItemList';
    this.data.itemListElement = [];
  }

  setItems(items: ListItem['item'][] | undefined): this {
    if (!items) {
      return this;
    }

    this.data.itemListElement = items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item,
    }));
    return this;
  }
}
