'use client';

import { Building2 } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  iconClassName?: string;
  iconSize?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ 
  className = '', 
  showText = true, 
  textClassName = '',
  iconClassName = '',
  iconSize = 'md'
}: LogoProps) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };
  
  const iconSizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const starSizeMap = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative ${sizeMap[iconSize]} rounded-lg bg-gradient-to-br from-[#0F2345] to-[#1E3A6B] flex items-center justify-center shadow-lg ${iconClassName}`}>
        <Building2 className={`${iconSizeMap[iconSize]} text-[#D4A64A]`} />
        <div className={`absolute -top-1 -right-1 ${starSizeMap[iconSize]}`}>
          <svg viewBox="0 0 24 24" fill="#D4A64A" className="w-full h-full drop-shadow-gold">
            <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,16.5 5.5,21 7.5,14 2,9 9,9" />
          </svg>
        </div>
      </div>
      {showText && (
        <span className={`font-bold tracking-tight ${textClassName}`}>
          Bintang<span className="text-[#D4A64A]">Agent</span>
        </span>
      )}
    </div>
  );
};