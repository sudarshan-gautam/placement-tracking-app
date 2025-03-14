'use client';

import React from 'react';
import { navigateWithReload } from '@/lib/navigation';

interface SafeLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * A safe link component that handles navigation between different layouts
 * This prevents blank screens when navigating between route groups
 */
export function SafeLink({ href, className, children }: SafeLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithReload(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
} 