import { injectable, inject } from "tsyringe";
import { Project } from "../domain/entities/Project";
import {
  ProjectRepository,
  ProjectListResult,
} from "../domain/repositories/ProjectRepository";
import { ProjectId } from "@core/types";
import { getEventBus } from "@core/EventBus";
import { PROJECT_REPOSITORY } from "@core/di/tokens";

export class ProjectNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectNotFoundError";
  }
}

@injectable()
export class ProjectService {
  constructor(
    @inject(PROJECT_REPOSITORY) private readonly repository: ProjectRepository
  ) {}

  private validateBoardName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Board name cannot be empty");
    }
  }

  async getProjectsPaginated(
    page: number,
    limit: number,
  ): Promise<ProjectListResult> {
    return await this.repository.loadProjectsPaginated(page, limit);
  }

  async getProjectById(projectId: ProjectId): Promise<Project> {
    const project = await this.repository.loadProjectById(projectId);

    if (!project) {
      throw new ProjectNotFoundError(
        `Project with id '${projectId}' not found`,
      );
    }

    return project;
  }

  async getProjectBySlug(slug: string): Promise<Project> {
    const project = await this.repository.loadProjectBySlug(slug);

    if (!project) {
      throw new ProjectNotFoundError(`Project with slug '${slug}' not found`);
    }

    return project;
  }

  async getProjectByIdWithDetails(projectId: ProjectId) {
    const repository = this.repository as any;
    if (!repository.loadProjectByIdWithDetails) {
      throw new Error("Repository does not support loading project details");
    }

    const result = await repository.loadProjectByIdWithDetails(projectId);
    if (!result) {
      throw new ProjectNotFoundError(`Project with id '${projectId}' not found`);
    }

    return result;
  }

  async createProject(
    name: string,
    description: string = "",
    color?: string,
  ): Promise<Project> {
    this.validateBoardName(name);

    const project = await this.repository.createProjectWithDefaults(
      name,
      description,
      color,
    );

    await getEventBus().publish("project_created", {
      projectId: project.id,
      projectName: project.name,
      timestamp: new Date(),
    });

    return project;
  }

  async updateProject(
    projectId: ProjectId,
    updates: { name?: string; description?: string; color?: string },
  ): Promise<Project> {
    const project = await this.getProjectById(projectId);

    if (updates.name) {
      this.validateBoardName(updates.name);
    }

    project.update(updates);
    await this.repository.saveProject(project);

    await getEventBus().publish("project_updated", {
      projectId: project.id,
      projectName: project.name,
      timestamp: new Date(),
    });

    return project;
  }

  async archiveProject(projectId: ProjectId): Promise<Project> {
    const project = await this.getProjectById(projectId);
    project.archive();
    await this.repository.saveProject(project);

    await getEventBus().publish("project_archived", {
      projectId: project.id,
      projectName: project.name,
      timestamp: new Date(),
    });

    return project;
  }

  async deleteProject(projectId: ProjectId): Promise<boolean> {
    const project = await this.getProjectById(projectId);
    const deleted = await this.repository.deleteProject(projectId);

    if (deleted) {
      await getEventBus().publish("project_deleted", {
        projectId: project.id,
        projectName: project.name,
        timestamp: new Date(),
      });
    }

    return deleted;
  }
}
