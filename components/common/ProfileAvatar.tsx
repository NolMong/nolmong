'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  useUserStore,
  type UserType,
  type ProfileTheme,
} from '@/store/useUserStore';

// 배경색 & 테두리 색깔 매핑
const themeStyles: Record<ProfileTheme, string> = {
  green: 'bg-primary-light border-primary',
  pink: 'bg-pink-light border-pink',
  caramel: 'bg-caramel-light border-caramel',
  brown: 'bg-border border-muted',
};

interface ProfileAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  type?: UserType;
  theme?: ProfileTheme; // 수동 지정 선택
}

export default function ProfileAvatar({
  size = 40,
  type,
  theme,
  className,
  ...props
}: ProfileAvatarProps) {
  const globalUserType = useUserStore((state) => state.userType);
  const globalProfileTheme = useUserStore((state) => state.profileTheme);

  // Prop이 넘어오면 우선 적용 없으면 store 값 적용
  const currentType = type || globalUserType;
  const currentTheme = theme || globalProfileTheme;

  const imageSrc =
    currentType === 'capi' ? '/images/capi2.webp' : '/images/bara2.webp';

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex items-center justify-center border-3 select-none transition-colors duration-200',
        themeStyles[currentTheme],
        className,
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      {...props}
    >
      <Image
        src={imageSrc}
        alt={`${currentType} Profile`}
        fill
        sizes={`${size}px`}
        priority
        className="object-cover object-top"
      />
    </div>
  );
}
