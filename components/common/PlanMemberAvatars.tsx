"use client";

import React, { useMemo } from "react";
import ProfileAvatar from "./ProfileAvatar";
import { usePresenceStore } from "@/store/usePresenceStore";
import { cn } from "@/lib/utils";

interface PlanMemberAvatarsProps {
  size?: number;
  overlapMargin?: string;
  className?: string;
}

// 지금 이 계획에 접속해 있는 다른 참여자들의 프로필을 겹쳐서 표시.
// 목록의 출처가 Ably presence로 별도 조회 없이 입장/이탈에 맞춰 실시간으로 변경
export default function PlanMemberAvatars({
  size = 32,
  overlapMargin = "-ml-3",
  className,
}: PlanMemberAvatarsProps) {
  const members = usePresenceStore((state) => state.members);
  const myUserId = usePresenceStore((state) => state.myUserId);

  const others = useMemo(() => {
    const seen = new Set<string>();

    return members.filter((member) => {
      // 내 프로필은 헤더에 이미 따로 있으므로 제외
      if (!member.userId || member.userId === myUserId) return false;
      // presence는 탭 단위라 한 사람이 여러 번 들어온다 — 사람 기준으로 한 번만
      if (seen.has(member.userId)) return false;
      seen.add(member.userId);
      return true;
    });
  }, [members, myUserId]);

  // 접속자가 나뿐이면 빈 자리를 남기지 않는다
  if (others.length === 0) return null;

  return (
    <div className={cn("flex items-center shrink-0", className)}>
      {others.map((member, index) => (
        <ProfileAvatar
          key={member.userId}
          size={size}
          type={member.character}
          theme={member.theme}
          className={index > 0 ? overlapMargin : ""}
        />
      ))}
    </div>
  );
}
