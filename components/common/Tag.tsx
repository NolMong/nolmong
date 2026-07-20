'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const tagVariants = cva('rounded-full w-fit font-jalnan-gothic', {
  variants: {
    size: {
      small: 'text-xs px-3 pt-[5px] pb-[3px] leading-none',
      medium: 'text-base px-4 py-2',
      large: 'text-lg px-5 py-3',
    },
    color: {
      primary: 'bg-primary text-primary-light',
      'primary-light': 'bg-primary-light text-primary',
      gray: 'bg-border text-muted',
      pink: 'bg-pink text-pink-light',
      'pink-light': 'bg-pink-light text-pink',
    },
  },
  defaultVariants: {
    size: 'small',
    color: 'primary-light',
  },
});

interface TagProps extends VariantProps<typeof tagVariants> {
  onClick?: () => void;
  children?: React.ReactNode;
  props?: React.HTMLAttributes<HTMLDivElement>;
}

export default function Tag({
  onClick,
  children,
  size,
  color,
  ...props
}: TagProps) {
  return (
    <div
      onClick={onClick}
      className={cn(tagVariants({ size, color }), onClick && 'cursor-pointer')}
      {...props}
    >
      {children}
    </div>
  );
}
