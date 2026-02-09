import { Inject, Injectable } from '@nestjs/common';
import { Project } from '../domain/project';
import { InvalidProjectNameError } from '../errors/invalid-project-name.error';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../repositories/project.repository';
import { ProjectCreateData } from '../data/project.create.data';
import { ProjectStatus } from '../domain/project';

@Injectable()
export class ProjectCreateUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(input: ProjectCreateData): Promise<Project> {
    const name = input.name?.trim();

    if (!name) {
      throw new InvalidProjectNameError();
    }

    const slug = await this.generateUniqueProjectSlug(name);
    const status = this.normalizeStatus(input.status);

    return this.projectRepository.create({
      userId: input.userId,
      name,
      slug,
      description: input.description?.trim() || null,
      color: input.color?.trim(),
      status,
      filePath: input.filePath ?? undefined,
    });
  }

  private async generateUniqueProjectSlug(name: string): Promise<string> {
    const letters = name.replace(/[^a-zA-Z]/g, '').toUpperCase();

    if (letters.length === 0) {
      throw new InvalidProjectNameError();
    }

    for (let length = 3; length <= letters.length; length++) {
      const candidate = letters.substring(0, length);
      const existing = await this.projectRepository.findBySlug(candidate);

      if (!existing) {
        return candidate;
      }
    }

    const timestamp = Date.now().toString(36).slice(-3).toUpperCase();
    return letters.substring(0, 3) + timestamp;
  }

  private normalizeStatus(status?: ProjectStatus): ProjectStatus | undefined {
    if (!status) {
      return undefined;
    }

    const allowed: ProjectStatus[] = ['active', 'archived', 'completed'];
    return allowed.includes(status) ? status : undefined;
  }
}
