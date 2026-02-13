'use client';

import { forwardRef, type HTMLAttributes, type ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onOpenChange(false); }}
    >
      <div className="fixed inset-0 bg-black/60" />
      <div className="relative z-50 w-full max-w-lg mx-4">{children}</div>
    </div>
  );
}

export const DialogContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { onClose?: () => void }>(
  ({ className, onClose, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-border bg-card p-6 shadow-2xl space-y-4',
        className,
      )}
      {...props}
    >
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>
      )}
      {children}
    </div>
  ),
);
DialogContent.displayName = 'DialogContent';

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-1', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('font-mono font-semibold text-base', className)} {...props} />;
}
