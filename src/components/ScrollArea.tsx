'use client';

import { ReactNode } from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import type { Options as OverlayScrollbarsOptions } from 'overlayscrollbars';

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
  options?: OverlayScrollbarsOptions;
}

export default function ScrollArea({ children, className, options }: ScrollAreaProps) {
  return (
    <OverlayScrollbarsComponent
      options={{ scrollbars: { autoHide: 'leave' }, ...options }}
      className={className}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
}