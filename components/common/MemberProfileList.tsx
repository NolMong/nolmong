'use client';

import React from 'react';
import { ProfileAvatar } from '@/components';
import type { MemberProfile } from '@/api/getPlans';

interface MemberProfileListProps {
  members?: MemberProfile[];
  size?: number;
  overlapMargin?: string;
  borderWidth?: number;
  className?: string;
}

export function MemberProfileList({
  members,
  size = 24,
  overlapMargin = '-ml-2',
  borderWidth,
  className = '',
}: MemberProfileListProps) {
  if (!members || members.length === 0) {
    return (
      <div className={`flex items-center shrink-0 ${className}`}>
        <ProfileAvatar size={size} borderWidth={borderWidth} />
      </div>
    );
  }

  return (
    <div className={`flex items-center shrink-0 ${className}`}>
      {members.map((member, index) => {
        const type = member.features?.[0];
        const theme = member.features?.[1];

        return (
          <ProfileAvatar
            key={member.id || index}
            size={size}
            type={type}
            theme={theme}
            borderWidth={borderWidth}
            className={index > 0 ? overlapMargin : ''}
          />
        );
      })}
    </div>
  );
}
