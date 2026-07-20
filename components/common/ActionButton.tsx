'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const actionButtonVariants = cva(
  'inline-flex items-center justify-center text-xs font-regular font-jalnan-gothic rounded-full px-3 py-1.5 cursor-pointer select-none transition-colors w-fit leading-[10px]',
  {
    variants: {
      variant: {
        // 삭제
        delete: 'bg-pink text-white hover:bg-[#FF7979]',
        // 취소
        cancel: 'bg-border text-muted hover:bg-[#E4E4E4]',
        // 확인
        confirm: 'bg-primary text-white hover:bg-[#93BC88]',
      },
    },
    defaultVariants: {
      variant: 'confirm',
    },
  },
);

interface ActionButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof actionButtonVariants> {}

export default function ActionButton({
  children,
  variant,
  className,
  ...props
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(actionButtonVariants({ variant }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
