'use client';

import Link from 'next/link';
import type { ProjectDto } from 'shared-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: ProjectDto;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:border-primary/30 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <CardTitle className="truncate">{project.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {project.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {project.description}
            </p>
          )}
          <Badge variant="secondary" className="text-[10px]">
            {project.status}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
