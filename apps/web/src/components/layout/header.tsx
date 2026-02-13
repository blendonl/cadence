'use client';

import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/agenda': 'Agenda',
  '/projects': 'Projects',
  '/notes': 'Notes',
  '/goals': 'Goals',
  '/routines': 'Routines',
  '/time': 'Time',
  '/profile': 'Profile',
};

export function Header() {
  const pathname = usePathname();
  const basePath = '/' + (pathname.split('/')[1] || '');
  const title = PAGE_TITLES[basePath] || '';

  return (
    <header className="flex items-center h-14 px-6 border-b border-border">
      <h1 className="font-mono font-semibold text-base tracking-tight">
        {title}
      </h1>
    </header>
  );
}
