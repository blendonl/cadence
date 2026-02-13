'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Calendar,
  FolderKanban,
  CheckSquare,
  FileText,
  Target,
  Clock,
  Repeat,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/routines', label: 'Routines', icon: Repeat },
  { href: '/time', label: 'Time', icon: Clock },
  { href: '/profile', label: 'Profile', icon: User },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-card border border-border md:hidden"
      >
        {collapsed ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar border-r border-border transition-transform duration-200 md:relative md:translate-x-0',
          collapsed ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'w-56',
        )}
      >
        <div className="flex items-center h-14 px-5 border-b border-border">
          <span className="font-mono font-semibold text-primary tracking-tight text-lg">
            cadence
          </span>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setCollapsed(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-accent text-sidebar-active font-medium'
                    : 'text-sidebar-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
