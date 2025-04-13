import { z } from 'zod';

type PathIdType = number | string | null;

class PathBuilder {
  private path: string = '';

  constructor(basePath: string = '') {
    this.path = basePath;
  }

  toString(): string {
    return this.path;
  }

  private generatePath(path: string, id?: PathIdType): PathBuilder {
    if (id != null && !Number.isNaN(id)) {
      return new PathBuilder(
        `${this.path}/${path}/${encodeURIComponent(id.toString())}`
      );
    }
    return new PathBuilder(`${this.path}/${path}`);
  }

  circles(id?: PathIdType): PathBuilder {
    return this.generatePath('circles', id);
  }

  comments(id?: PathIdType): PathBuilder {
    return this.generatePath('comments', id);
  }

  projects(id?: PathIdType): PathBuilder {
    return this.generatePath('projects', id);
  }

  notes(id?: PathIdType): PathBuilder {
    return this.generatePath('notes', id);
  }

  milestones(id?: PathIdType): PathBuilder {
    return this.generatePath('milestones', id);
  }

  tasks(id?: PathIdType): PathBuilder {
    return this.generatePath('tasks', id);
  }

  images(id?: PathIdType): PathBuilder {
    return this.generatePath('images', id);
  }

  outcomes(id?: PathIdType): PathBuilder {
    return this.generatePath('outcomes', id);
  }

  reviews(id?: PathIdType): PathBuilder {
    return this.generatePath('reviews', id);
  }

  users(id?: PathIdType): PathBuilder {
    return this.generatePath('users', id);
  }

  tags(id?: PathIdType): PathBuilder {
    return this.generatePath('tags', id);
  }

  marathons(id?: PathIdType): PathBuilder {
    return this.generatePath('marathons', id);
  }
}

export const apiPaths = new PathBuilder();

export const parseParamsToNumber = (searchParams?: string | null) => {
  if (searchParams == null) return null;

  return z
    .number()
    .int()
    .or(z.string().regex(/^\d*$/))
    .transform((val) => parseInt(val.toString(), 10))
    .safeParse(searchParams).data;
};
