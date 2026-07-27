'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { acceptInvite } from '@/api/acceptInvite';
import { getPlans } from '@/api/getPlans';
import { MainButton } from '@/components';

export function InviteModal() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAlreadyMember, setIsAlreadyMember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const inviteUuid = searchParams?.get('invite') ?? null;

  // 토스트 메시지 출력
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // URL 쿼리 파라미터(?invite=uuid) 제거 유틸
  const clearInviteQuery = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams?.toString() ?? '');
    nextParams.delete('invite');
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [searchParams, pathname, router]);

  // 접속한 유저가 해당 플랜의 멤버인지 확인
  useEffect(() => {
    if (!inviteUuid) return;

    getPlans().then((res) => {
      if (res.data) {
        const alreadyIn = res.data.some((plan) => plan.uuid === inviteUuid);
        if (alreadyIn) {
          setIsAlreadyMember(true);
          showToast('이미 참여 중인 여행입니다.');
          clearInviteQuery();
        }
      }
    });
  }, [inviteUuid, clearInviteQuery, showToast]);

  // 초대 수락 처리
  const handleAcceptInvite = async () => {
    if (!inviteUuid || isLoading) return;
    setIsLoading(true);

    try {
      const result = await acceptInvite(inviteUuid);

      if (result.success) {
        clearInviteQuery();
        router.push(`/plan/${inviteUuid}?tab=WISHLIST`);
      } else {
        showToast(result.message);
        clearInviteQuery();
      }
    } catch (error) {
      console.error('초대 수락 실패:', error);
      showToast('초대 수락 중 오류가 발생했습니다.');
      clearInviteQuery();
    } finally {
      setIsLoading(false);
    }
  };

  // 초대 거절 처리
  const handleRejectInvite = () => {
    clearInviteQuery();
  };

  const showInviteModal = Boolean(inviteUuid && !isAlreadyMember);

  return (
    <>
      {/* 초대 수락 확인 모달 */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl text-center flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="text-5xl"
              >
                🧳
              </motion.div>
              <div className="mt-2">
                <h3 className="text-xl font-bold text-main">여행 계획 초대</h3>
                <p className="mt-1 text-sm text-sub">
                  새로운 여행 계획에 초대되셨습니다.
                  <br />
                  함께 여행을 계획하시겠습니까?
                </p>
              </div>

              <div className="mt-2 flex w-full justify-center gap-1">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1"
                >
                  <MainButton
                    variant="default"
                    onClick={handleRejectInvite}
                    width="100%"
                  >
                    거절
                  </MainButton>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1"
                >
                  <MainButton
                    variant="fill"
                    onClick={handleAcceptInvite}
                    width="100%"
                  >
                    수락하기
                  </MainButton>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 토스트 메세지 */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-10 left-1/2 z-50 rounded-lg bg-black/80 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
