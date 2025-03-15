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
}

export const apiPaths = new PathBuilder();
