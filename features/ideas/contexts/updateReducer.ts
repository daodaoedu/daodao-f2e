import type { IdeaSchema } from '@/services/modules/ideas';

type IdeaResource = {
  id?: number;
  name: string;
  url: string;
};

type AllowedUpdateFields = {
  id: string;
  title?: string;
  content?: string;
  imageUrls?: string[] | null;
  videoUrls?: string[] | null;
  visibility?: string;
  ideaResources?: IdeaResource[];
  viewCount?: number;
};

export type UpdateAction = Required<Pick<AllowedUpdateFields, 'id'>> &
  Partial<Omit<AllowedUpdateFields, 'id'>>;

export function updateIdea(idea: IdeaSchema, updates: UpdateAction): IdeaSchema {
  if (idea.id !== updates.id) {
    return idea;
  }

  const { ...updateValues } = updates;
  const result = { ...idea };

  Object.entries(updateValues).forEach(([key, value]) => {
    if (key in idea) {
      const typedKey = key as keyof typeof updateValues;

      if (typeof value === 'number' && key.toLowerCase().includes('count')) {
        const currentValue = Number(result[typedKey] ?? 0);
        result[typedKey] = currentValue + value as never;
      } else if (key === 'ideaResources' && Array.isArray(value)) {
        // Cast value to IdeaResource[] to ensure type safety
        const resources = value as IdeaResource[];
        result[typedKey] = resources.map((resource) => ({
          id: resource.id ?? Math.floor(Math.random() * 1000000),
          name: resource.name,
          url: resource.url
        })) as never;
      } else {
        result[typedKey] = value as never;
      }
    }
  });

  return result;
}
