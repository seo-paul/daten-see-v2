import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn } from '@/lib/utils/cn';

// Card variants following DATEN-SEE design system
const cardVariants = cva(
  'bg-surface-primary border border-border-primary rounded-lg',
  {
    variants: {
      variant: {
        default: 'shadow-sm',
        elevated: 'shadow-lg',
        interactive: 'shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer',
        flat: 'shadow-none',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

/**
 * DATEN-SEE Card Component
 * Base container component for content sections, widgets, and layouts
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <div
        className={cn(cardVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header - for titles and actions
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  actions?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, actions, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex items-center justify-between space-x-4 pb-4 border-b border-border-primary',
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="flex-1 min-w-0">{children}</div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Card Title
 */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold text-lg text-text-primary', className)}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

/**
 * Card Description
 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-text-secondary mt-1', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

/**
 * Card Content - main content area
 */
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('pt-4', className)}
    {...props}
  />
));

CardContent.displayName = 'CardContent';

/**
 * Card Footer - for actions and secondary content
 */
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('pt-4 border-t border-border-primary', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

/**
 * Widget Card - specialized card for dashboard widgets
 * Includes minimum height and widget-specific styling
 */
export interface WidgetCardProps extends Omit<CardProps, 'size'> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  loading?: boolean;
}

export const WidgetCard = React.forwardRef<HTMLDivElement, WidgetCardProps>(
  ({ 
    className, 
    title, 
    description, 
    actions, 
    loading = false,
    children, 
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn('min-h-widget-min', className)}
        size="md"
        {...props}
      >
        {/* Widget Header */}
        {(title || actions) && (
          <CardHeader actions={actions}>
            {title && (
              <div>
                <CardTitle className="text-base">{title}</CardTitle>
                {description && (
                  <CardDescription>{description}</CardDescription>
                )}
              </div>
            )}
          </CardHeader>
        )}

        {/* Widget Content */}
        <CardContent className={cn(title || actions ? 'pt-4' : 'pt-0')}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    );
  }
);

WidgetCard.displayName = 'WidgetCard';

export default Card;