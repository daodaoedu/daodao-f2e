type PathIdType = number | string;

class PathBuilder {
  private path: string = '';

  constructor(basePath: string = '') {
    this.path = basePath;
  }

  toString(): string {
    return this.path;
  }

  private generatePath(path: string, id?: PathIdType | null): PathBuilder {
    if (id) {
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
}

export const apiPaths = new PathBuilder();
