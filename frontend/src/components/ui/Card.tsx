import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  glow?: boolean;
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = true, glow = false, interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border transition-all duration-300',
          glass
            ? 'bg-dark-900/60 backdrop-blur-xl border-slate-800/80 shadow-glass'
            : 'bg-dark-900 border-slate-800 shadow-md',
          glow && 'relative before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gradient-to-r before:from-brand-600/20 before:to-electric-cyan/20 before:blur-xl',
          interactive && 'hover:border-brand-500/50 hover:shadow-glow-sm hover:-translate-y-0.5 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
