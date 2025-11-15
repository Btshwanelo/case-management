import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full max-h-fit border px-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-full',
  {
    variants: {
      variant: {
        default: 'border-primary-400 bg-primary text-primary-foreground',
        success: 'border-green-400 bg-green-100 text-green-600',
        error: 'border-red-400 bg-red-100 text-red-600',
        pending: 'border-blue-400 bg-blue-100 text-blue-600',
        purple: 'border-purple-400 bg-purple-100 text-purple-600',
        yellow: 'border-yellow-400 bg-yellow-100 text-yellow-600',
        blue: 'border-blue-400 bg-blue-100 text-blue-600',
        secondary: 'border-secondary-400 bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  maxWidth?: string;
}

function Badge({ className, variant, maxWidth, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} style={{ maxWidth: maxWidth }} {...props} />;
}

export { Badge, badgeVariants };
