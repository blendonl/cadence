'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useQuickCreateTask } from '@/hooks/use-tasks';
import { Plus } from 'lucide-react';

export function QuickCreate() {
  const [title, setTitle] = useState('');
  const quickCreate = useQuickCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    quickCreate.mutate({ title: title.trim() }, { onSuccess: () => setTitle('') });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Plus size={14} className="text-muted-foreground shrink-0" />
      <Input
        placeholder="Quick add task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-8 text-sm border-none bg-transparent focus-visible:ring-0 px-0"
      />
    </form>
  );
}
