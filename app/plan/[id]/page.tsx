'use client';

import {
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { MainButton, MapModal } from '@/components';
import { usePlanTabStore } from '@/store/usePlanTabStore';
import { useAutoSavePlan } from '@/hooks/useAutoSavePlan';
import { Check, LucideEdit3 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import WishlistTab from './_components/WishlistTab';
import PlanDetailsTab from './_components/PlanDetailsTab';
import { updateSupabaseTitle } from '@/api/updateSupabaseTitle';
import { usePlanSync } from '@/hooks/usePlanSync';
import { usePlanStore } from '@/store/usePlanStore';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: uuid } = use(params);
  const { activePlanTab, setPlanTab } = usePlanTabStore();
  const { title, updateTitle } = usePlanStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [titleEditMode, setTitleEditMode] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // 편집 모드 진입 시에만 포커스 이동 (DOM 동기화 목적이라 effect가 적절)
  useEffect(() => {
    if (titleEditMode) {
      titleRef.current?.focus();
    }
  }, [titleEditMode]);

  // 타이틀 편집 종료(체크 버튼 클릭 / Enter) 시 확인 후 저장
  const handleTitleEditToggle = () => {
    if (titleEditMode) {
      const newTitle = titleRef.current?.innerText.trim();
      let applied = false;
      if (newTitle && newTitle !== title) {
        if (
          confirm(
            '여행 제목을 수정하시겠습니까?\n(※ 다른 사람들에게도 동일하게 보입니다.)',
          )
        ) {
          updateTitle(newTitle);
          updateSupabaseTitle({ data: { planId: uuid, title: newTitle } });
          applied = true;
        }
      }
      // 저장하지 않은 경우(취소 / 빈 값) contentEditable에 남은 입력값을
      // 원래 제목으로 되돌린다. React는 title state가 안 바뀌면 이 텍스트
      // 노드를 갱신하지 않아서, 안 해주면 취소해도 바뀐 것처럼 보인다.
      if (!applied && titleRef.current) {
        titleRef.current.innerText = title || '여행';
      }
    }
    setTitleEditMode(!titleEditMode);
  };

  // 타이틀 수정 - 키 다운 이벤트
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleEditToggle();
    }
  };

  // 토스트 메세지 함수
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // 링크 복사 기능
  const handleCopyInviteLink = useCallback(async () => {
    try {
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const inviteUrl = `${window.location.origin}/main?invite=${uuid}`;

      await navigator.clipboard.writeText(inviteUrl);
      showToast('초대 링크가 복사되었습니다!');
    } catch (error) {
      console.error('링크 복사 실패:', error);
      showToast('링크 복사에 실패했습니다.');
    }
  }, [uuid, showToast]);

  // 탭 상태 동기화
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab === 'PLAN_DETAILS' || tab === 'WISHLIST') {
      setPlanTab(tab);
    }
  }, [searchParams, setPlanTab]);

  // Header의 초대하기 버튼 이벤트 수신
  useEffect(() => {
    const handleTriggerCopy = () => {
      handleCopyInviteLink();
    };

    window.addEventListener('trigger-invite-copy', handleTriggerCopy);
    return () => {
      window.removeEventListener('trigger-invite-copy', handleTriggerCopy);
    };
  }, [handleCopyInviteLink]);

  const handleTabClick = (tab: 'WISHLIST' | 'PLAN_DETAILS') => {
    setPlanTab(tab);

    const nextParams = new URLSearchParams(searchParams?.toString() ?? '');
    nextParams.set('tab', tab);

    router.replace(`${pathname}?${nextParams.toString()}`);
  };

  // 주기적 저장 활성화
  useAutoSavePlan(uuid);

  // ably의 uuid 채널을 구독해서 데이터 연동
  usePlanSync(uuid);

  return (
    <main className='relative flex flex-col min-w-300 w-300 mx-auto px-5 pt-8 pb-10'>
      {/* 헤더 타이틀 및 탭 버튼 */}
      <MapModal />
      <div className='flex flex-col gap-5'>
        <div className='flex gap-2'>
          <div
            ref={titleRef}
            className={`text-xl font-jalnan-gothic text-sub outline-0 ${titleEditMode ? 'w-200 border border-border bg-white py-2 px-3 rounded-md' : ''}`}
            contentEditable={titleEditMode}
            suppressContentEditableWarning
            onKeyDown={handleKeyDown}
          >
            {title || '여행'}
          </div>
          <button className='cursor-pointer' onClick={handleTitleEditToggle}>
            {titleEditMode ? (
              <Check size={24} className='text-primary' />
            ) : (
              <LucideEdit3 size={14} className='text-muted' />
            )}
          </button>
        </div>

        <div className='flex gap-2 mb-7'>
          <MainButton
            variant={activePlanTab === 'WISHLIST' ? 'lightFill' : 'default'}
            className='py-2 px-4'
            onClick={() => handleTabClick('WISHLIST')}
          >
            가고 싶은 곳
          </MainButton>
          <MainButton
            variant={activePlanTab === 'PLAN_DETAILS' ? 'lightFill' : 'default'}
            className='py-2 px-4'
            onClick={() => handleTabClick('PLAN_DETAILS')}
          >
            상세 계획
          </MainButton>
        </div>
      </div>

      {/* 탭별 뷰 렌더링 */}
      {activePlanTab === 'PLAN_DETAILS' ? <PlanDetailsTab /> : <WishlistTab />}

      {toastMessage && (
        <div className='fixed bottom-10 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-black/80 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-all animate-bounce'>
          {toastMessage}
        </div>
      )}
    </main>
  );
}
