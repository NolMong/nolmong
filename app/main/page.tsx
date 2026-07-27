'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { getPlans, PlanType } from '@/api/getPlans';
import { acceptInvite } from '@/api/acceptInvite';
import {
  CalendarComponent,
  CreatePlanModal,
  MainButton,
  Tag,
  TravelCard,
} from '@/components';
import { useCreatePlanModalStore } from '@/store/useModalStore';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

function MainPageContent() {
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const openCreatePlanModal = useCreatePlanModalStore((state) => state.open);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const inviteUuid = searchParams?.get('invite') ?? null;

  const isAlreadyMember = Boolean(
    inviteUuid && plans.some((plan) => plan.uuid === inviteUuid),
  );

  // 디버깅용 로그
  useEffect(() => {
    console.log('Current inviteUuid:', inviteUuid);
  }, [inviteUuid]);

  // 토스트 메시지
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

  // 플랜 목록 불러오기
  const fetchPlans = useCallback(() => {
    getPlans().then((res) => {
      if (res.error) {
        console.error('Error fetching plans:', res.error);
      } else {
        console.log('Fetched plans:', res.data);
        setPlans(res.data);
      }
    });
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (isAlreadyMember) {
      const timer = setTimeout(() => {
        showToast('이미 참여 중인 여행입니다.');
        clearInviteQuery();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isAlreadyMember, showToast, clearInviteQuery]);

  // 초대 수락 처리
  const handleAcceptInvite = async () => {
    if (!inviteUuid) return;

    try {
      const result = await acceptInvite(inviteUuid);

      if (result.success) {
        // 수락 후 해당 여행 상세 페이지로 바로 이동
        router.push(`/plan/${inviteUuid}?tab=WISHLIST`);
      } else {
        showToast(result.message);
        clearInviteQuery();
      }
    } catch (error) {
      console.error('초대 수락 실패:', error);
      showToast('초대 수락 중 오류가 발생했습니다.');
      clearInviteQuery();
    }
  };

  // 초대 거절 처리
  const handleRejectInvite = () => {
    clearInviteQuery(); // 쿼리만 깔끔하게 지우고 메인 유지
  };

  // 방에서 나간 카드를 화면에서 즉시 제거하는 핸들러
  const handleLeaveSuccess = (leftPlanId: number) => {
    setPlans((prevPlans) => prevPlans.filter((p) => p.id !== leftPlanId));
  };

  // 모달을 표시할 조건
  const showInviteModal = Boolean(inviteUuid && !isAlreadyMember);

  return (
    <div className=" bg-[#FDFDFD] min-h-screen">
      <CreatePlanModal />
      <div className="min-w-300 w-300 mx-auto px-5 py-8">
        {/* 위에 달력 & 새 일정 만드는 버튼 */}
        <div className="flex gap-5 h-fit mb-15">
          <div className="shrink-0 box w-[384px] px-9 pt-1 rounded-2xl shadow-[0px_4px_10px_0px_#b5b5b540]">
            <CalendarComponent size="medium" />
            <div className="w-full h-px bg-border mt-2"></div>
            <div className="flex items-center gap-2 py-2 px-2.5">
              <div className="w-6 h-6 rounded-full bg-primary-light"></div>
              <Tag color="primary">진행중</Tag>
              <div className="text-xs text-muted h-full">제주도 힐링 투어</div>
            </div>
          </div>

          <button
            onClick={openCreatePlanModal}
            className="cursor-pointer relative flex-1 self-stretch rounded-2xl shadow-[0px_4px_10px_0px_#b5b5b540] overflow-hidden"
          >
            <Image
              src="/images/landing_bg.webp"
              alt="Main Image"
              fill
              loading="eager"
              className="object-cover object-left"
            />
            <Image
              src="/images/capi1.webp"
              alt="Capi Image"
              width={100}
              height={100}
              className="absolute bottom-[-15%] left-[17%] w-[10%] h-auto -translate-y-1/2"
            />
            <Image
              src="/images/bara1.webp"
              alt="Bara Image"
              width={100}
              height={100}
              className="absolute bottom-[-15%] left-[27%] w-[10%] h-auto -translate-y-1/2"
            />
            <div className="absolute top-5.5 left-8 text-white font-jalnan text-2xl text-left leading-[1.4]">
              카피, 바라와 함께
              <br />
              여행 계획을 짜볼까요?
            </div>
            <div className="absolute top-24.5 left-8 text-white">
              친구들을 초대해 실시간으로 계획을 만들고 공유해봐요.
            </div>
            <div className="absolute top-5.5 right-8 bg-[#36B9FD] text-white rounded-full w-50 h-10 text-sm font-bold flex items-center justify-center">
              새 여행 일정 만들러 가기
            </div>
          </button>
        </div>
        <div className="px-4">
          <div className="flex items-center gap-1">
            <div className="text-2xl font-jalnan text-main mr-2">나의 여행</div>
            <Tag>{plans.length}개</Tag>
          </div>

          {plans.length > 0 ? (
            <div className="grid grid-cols-3 gap-y-6 py-6 ">
              {plans.map((plan) => (
                <TravelCard
                  key={plan.id}
                  data={plan}
                  onLeave={handleLeaveSuccess}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-primary-light border-2 border-main/20 border-dashed gap-8 mt-4">
              {/* 이미지 */}
              <div className="flex">
                <div className="relative w-30 h-30 -mr-2.5">
                  <Image
                    src="/images/capi2.webp"
                    alt="카피"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="relative w-30 h-30 -ml-2.5">
                  <Image
                    src="/images/bara2.webp"
                    alt="바라"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-2">
                <h3 className="text-xl font-jalnan text-main">
                  아직 등록된 여행 계획이 없어요!
                </h3>
                <p className="text-sm text-sub text-center leading-relaxed">
                  친구들과 함께 새로운 여행 계획을 만들고
                  <br />
                  실시간으로 일정을 공유해보세요.
                </p>

                <MainButton
                  onClick={openCreatePlanModal}
                  variant={'round'}
                  className="px-10 mt-4 shadow-card"
                >
                  새 여행 일정 만들러 가기
                </MainButton>
              </div>
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
}

export default function MainPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MainPageContent />
    </Suspense>
  );
}
