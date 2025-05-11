'use client';

import React, { useState, ReactNode, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ChevronDown } from 'lucide-react';

interface CollapseCardProps {
  title: string;
  icon?: ReactNode;
  defaultExpanded?: boolean;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
}

export function CollapseCard({
  title,
  icon,
  defaultExpanded = true,
  children,
  actions,
  className = '',
  headerClassName = '',
  titleClassName = ''
}: CollapseCardProps) {
  // Using useRef to track initial mount and prevent unnecessary re-renders
  const initialRender = useRef(true);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // Only set expanded state from props on initial mount to avoid loops
  useEffect(() => {
    if (initialRender.current) {
      setIsExpanded(defaultExpanded);
      initialRender.current = false;
    }
  }, [defaultExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader 
        className={`flex flex-row items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 ${headerClassName}`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <CardTitle className={`text-lg font-semibold ${titleClassName}`}>{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {actions && (
            <div onClick={(e) => e.stopPropagation()}>
              {actions}
            </div>
          )}
          <ChevronDown 
            className={`h-5 w-5 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="px-6 pb-6">
          {children}
        </CardContent>
      )}
    </Card>
  );
} 