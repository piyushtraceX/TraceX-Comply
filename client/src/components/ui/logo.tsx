import React from 'react';
import { cn } from '@/lib/utils';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'white';
}

export function Logo({
  className,
  size = 'md',
  variant = 'primary',
  ...props
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const iconColorClasses = {
    primary: 'bg-primary-600 text-white',
    white: 'bg-white text-primary-600',
  };

  return (
    <div className={cn('flex items-center', className)} {...props}>
      <div className={cn(
        sizeClasses[size], 
        iconColorClasses[variant], 
        'rounded-md flex items-center justify-center'
      )}>
        <svg xmlns="http://www.w3.org/2000/svg" className={cn('h-[65%] w-[65%]')} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812a3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      <span className={cn('font-bold ml-2', textSizeClasses[size])}>EUDR Comply</span>
    </div>
  );
}