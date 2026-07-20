'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center text-sm font-medium transition-colors focus:outline-none cursor-pointer select-none w-fit py-2.5 px-4',
  {
    variants: {
      variant: {
        // color: white 배경 + primary 테두리
        color:
          'border border-primary bg-white text-primary rounded-lg hover:bg-primary-light',
        // default: white 배경 + border 테두리
        default:
          'border border-border bg-white text-main rounded-lg hover:bg-border',
        // fill: primary 배경 + none 테두리 + white 글씨
        fill: 'bg-primary text-white rounded-lg hover:bg-[#95CC85]',
        //pinkFill: pink 배경 + none 테두리 + white 글씨
        pinkFill: 'bg-pink text-white rounded-lg hover:bg-[#f4b0b0]',
        // empty color: primary light 배경 + primary 테두리
        emptyColor:
          'border border-primary bg-color-primary-light text-primary rounded-lg hover:bg-[#95CC85] hover:text-white',
        // disabled
        disabled: 'bg-border text-white rounded-lg cursor-not-allowed',
        // round: radius 999
        round: 'bg-primary text-white rounded-full hover:bg-[#95CC85]',
      },
    },
    defaultVariants: {
      variant: 'color',
    },
  },
);

interface MainButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  width?: string;
  height?: string;
}

export default function MainButton({
  children,
  variant,
  className,
  width,
  height,
  style,
  ...props
}: MainButtonProps) {
  const isDisabled = variant === 'disabled' || props.disabled;

  return (
    <button
      type='button'
      className={cn(buttonVariants({ variant }), className)}
      style={{
        width: width || 'auto',
        height: height || 'auto',
        cursor: isDisabled ? 'not-allowed' : style?.cursor || 'pointer',
        ...style,
      }}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  );
}
