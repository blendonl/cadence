'use client';

import { useProjects } from '@/hooks/use-projects';
import { ProjectCard } from './project-card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProjectList() {
  const { data, isLoading } = useProjects({ status: 'active' });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const projects = data?.items || [];

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No projects yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
