'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectList } from '@/components/projects/project-list';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';

export default function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-lg font-semibold">All Projects</h2>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={14} /> New Project
        </Button>
      </div>
      <ProjectList />
      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
