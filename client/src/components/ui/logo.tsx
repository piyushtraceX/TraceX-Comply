import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';

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
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
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
    <Link href="/">
      <div className={cn('flex items-center cursor-pointer', className, isRTL && 'flex-row-reverse')} {...props}>
        <div className={cn(
          sizeClasses[size], 
          iconColorClasses[variant], 
          'rounded-md flex items-center justify-center flex-shrink-0'
        )}>
          <svg xmlns="http://www.w3.org/2000/svg" className={cn('h-[65%] w-[65%]')} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812a3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className={cn('flex flex-col', isRTL ? 'mr-2 items-end' : 'ml-2')}>
          <span className={cn('font-bold leading-tight', textSizeClasses[size])}>{t('app.name')}</span>
          <span className="text-xs text-gray-500 leading-tight">EUDR Compliance Platform</span>
        </div>
      </div>
    </Link>
  );
}