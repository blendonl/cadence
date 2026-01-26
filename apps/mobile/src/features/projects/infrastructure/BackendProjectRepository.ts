import { injectable, inject } from "tsyringe";
import { ProjectId } from "@core/types";
import { Project } from "@features/projects/domain/entities/Project";
import {
  ProjectRepository,
  ProjectListResult,
} from "@features/projects/domain/repositories/ProjectRepository";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";
import { BACKEND_API_CLIENT } from "@core/di/tokens";
import {
  ProjectDto,
  ProjectDetailDto,
  ProjectListResponseDto,
} from "shared-types";

export interface ProjectWithDetails {
  project: Project;
  boards: Array<{ id: string; name: string; columnCount: number }>;
  notes: Array<{
    id: string;
    title: string;
    content: string;
    preview: string | null;
    updatedAt: Date;
  }>;
  stats: {
    boardCount: number;
    noteCount: number;
    timeThisWeek: number;
  };
}

@injectable()
export class BackendProjectRepository implements ProjectRepository {
  constructor(
    @inject(BACKEND_API_CLIENT) private readonly apiClient: BackendApiClient,
  ) {}

  async loadProjectsPaginated(
    page: number,
    limit: number,
  ): Promise<ProjectListResult> {
    const safeLimit = Math.min(limit, 100);
    const response = await this.apiClient.request<ProjectListResponseDto>(
      `/projects?page=${page}&limit=${safeLimit}`,
    );

    return {
      items: response.items.map((item) => this.mapDtoToEntity(item)),
      total: response.total,
      page: response.page,
      limit: response.limit,
      hasMore:
        response.items.length === safeLimit &&
        response.items.length * page < response.total,
    };
  }

  async loadProjectById(projectId: ProjectId): Promise<Project | null> {
    const dto = await this.apiClient.requestOrNull<ProjectDto>(
      `/projects/${projectId}`,
    );
    if (!dto) {
      return null;
    }
    return this.mapDtoToEntity(dto);
  }

  async loadProjectByIdWithDetails(
    projectId: ProjectId,
  ): Promise<ProjectWithDetails | null> {
    const dto = await this.apiClient.requestOrNull<ProjectDetailDto>(
      `/projects/${projectId}?includeDetails=true`,
    );
    if (!dto) {
      return null;
    }

    return {
      project: this.mapDtoToEntity(dto),
      boards: dto.boards.map((b) => ({
        id: b.id,
        name: b.name,
        columnCount: b.columnCount,
      })),
      notes: dto.notes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        preview: n.preview,
        updatedAt: new Date(n.updatedAt),
      })),
      stats: {
        boardCount: dto.stats.boardCount,
        noteCount: dto.stats.noteCount,
        timeThisWeek: dto.stats.timeThisWeek,
      },
    };
  }

  async loadProjectBySlug(slug: string): Promise<Project | null> {
    let page = 1;
    const limit = 100;

    while (true) {
      const result = await this.loadProjectsPaginated(page, limit);
      const match = result.items.find((project) => project.slug === slug);
      if (match) {
        return match;
      }

      if (!result.hasMore) {
        return null;
      }

      page += 1;
    }
  }

  async saveProject(_project: Project): Promise<void> {
    console.warn("Backend project updates are not supported yet.");
  }

  async deleteProject(_projectId: ProjectId): Promise<boolean> {
    console.warn("Backend project deletion is not supported yet.");
    return false;
  }

  async listProjectSlugs(): Promise<string[]> {
    const slugs: string[] = [];
    let page = 1;
    const limit = 100;

    while (true) {
      const result = await this.loadProjectsPaginated(page, limit);
      slugs.push(...result.items.map((project) => project.slug));

      if (!result.hasMore) {
        break;
      }

      page += 1;
    }

    return slugs;
  }

  async createProjectWithDefaults(
    name: string,
    description?: string,
    color?: string,
  ): Promise<Project> {
    const payload = {
      name,
      description: description || undefined,
      color: color || undefined,
      status: "active",
    };

    const dto = await this.apiClient.request<ProjectDto>("/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return this.mapDtoToEntity(dto);
  }

  private mapDtoToEntity(dto: ProjectDto): Project {
    return new Project({
      id: dto.id,
      name: dto.name,
      slug: dto.slug,
      description: dto.description || "",
      color: dto.color,
      status: dto.status,
      created_at: dto.createdAt ? new Date(dto.createdAt) : undefined,
      updated_at: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
      file_path: dto.filePath,
    });
  }
}
