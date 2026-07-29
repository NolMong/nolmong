"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getPlans, PlanType } from "@/api/getPlans";
import {
  CalendarComponent,
  CreatePlanModal,
  FilterButton,
  MainButton,
  ProfileAvatar,
  Tag,
  TravelCard,
} from "@/components";
import { useCreatePlanModalStore } from "@/store/useModalStore";
import Image from "next/image";
import type { TravelEntry } from "@/types/calendar";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { MemberProfileList } from "@/components/common/MemberProfileList";

dayjs.extend(isSameOrAfter);

// 한 페이지에 보여줄 여행 카드 수
// 9, 12, 15 | default = 12
const PAGE_SIZE_OPTIONS = [9, 12, 15];

function MainPageContent() {
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [isPlansLoaded, setIsPlansLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [travels, setTravels] = useState<TravelEntry[]>([]);
  const openCreatePlanModal = useCreatePlanModalStore((state) => state.open);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Travel Card 정렬
  const sortedPlans = useMemo(() => {
    if (!plans.length) return [];

    const today = dayjs().startOf("day");

    return [...plans].sort((a, b) => {
      const aEnd = dayjs(a.end_day || a.start_day).startOf("day");
      const bEnd = dayjs(b.end_day || b.start_day).startOf("day");
      const aStart = dayjs(a.start_day).startOf("day");
      const bStart = dayjs(b.start_day).startOf("day");

      const isAUpcoming = aEnd.isAfter(today) || aEnd.isSame(today, "day");
      const isBUpcoming = bEnd.isAfter(today) || bEnd.isSame(today, "day");

      if (isAUpcoming && !isBUpcoming) return -1;
      if (!isAUpcoming && isBUpcoming) return 1;

      if (isAUpcoming && isBUpcoming) {
        const diff = aStart.diff(bStart);
        if (diff !== 0) return diff;
        return dayjs(b.created_at).diff(dayjs(a.created_at));
      } else {
        const diff = bEnd.diff(aEnd);
        if (diff !== 0) return diff;
        return dayjs(b.created_at).diff(dayjs(a.created_at));
      }
    });
  }, [plans]);

  // 오늘 날짜 기준 가장 가까운 여행 1개 선택
  const featuredPlan = useMemo(() => {
    if (!plans.length) return null;

    const today = dayjs().startOf("day");

    // 진행중이거나 예정된 여행 중 가장 시작일이 가까운 여행
    const upcomingPlans = plans
      .filter((plan) => {
        const end = dayjs(plan.end_day || plan.start_day).startOf("day");
        return end.isAfter(today) || end.isSame(today, "day");
      })
      .sort((a, b) => {
        const diff = dayjs(a.start_day)
          .startOf("day")
          .diff(dayjs(b.start_day).startOf("day"));
        if (diff !== 0) return diff;
        return dayjs(b.created_at).diff(dayjs(a.created_at));
      });

    if (upcomingPlans.length > 0) {
      return upcomingPlans[0];
    }

    // 예정된 여행이 없는 경우 지난 여행 중 가장 최근에 끝난 여행
    const pastPlans = plans
      .filter((plan) => {
        const end = dayjs(plan.end_day || plan.start_day).startOf("day");
        return end.isBefore(today);
      })
      .sort((a, b) => {
        const diff = dayjs(b.end_day)
          .startOf("day")
          .diff(dayjs(a.end_day).startOf("day"));
        if (diff !== 0) return diff;
        return dayjs(b.created_at).diff(dayjs(a.created_at));
      });

    return pastPlans[0] || null;
  }, [plans]);

  // 상단 캘린더 하단 태그 상태 계산
  const statusTagLabel = useMemo(() => {
    if (!featuredPlan) return "일정없음";

    const today = dayjs().startOf("day");
    const start = dayjs(featuredPlan.start_day).startOf("day");
    const end = dayjs(featuredPlan.end_day || featuredPlan.start_day).startOf(
      "day",
    );

    // 진행중
    if (
      (today.isAfter(start) || today.isSame(start, "day")) &&
      (today.isBefore(end) || today.isSame(end, "day"))
    ) {
      return "진행중";
    }

    // 예정된 일정 D-Day 표시
    if (start.isAfter(today)) {
      const diffDays = start.diff(today, "day");
      return diffDays === 0 ? "D-Day" : `D-${diffDays}`;
    }

    // 예정된 일정이 없는 경우
    return "일정없음";
  }, [featuredPlan]);

  // 플랜 전체를 이미 받아온 상태라 화면에 보일 만큼만 잘라서 렌더
  // 카드가 줄어(방 나가기 등) 현재 페이지가 사라진 경우를 렌더 시점에 보정.
  // 이후 페이지 계산은 전부 safePage 기준으로 한다.
  const totalPages = Math.max(1, Math.ceil(sortedPlans.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedPlans = sortedPlans.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  // 목록 상단으로 이동 처리
  const travelSectionRef = useRef<HTMLDivElement>(null);
  const scrollToTravelSection = () => {
    travelSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // 페이지당 개수가 바뀌면 현재 첫 카드가 속하는 새 페이지로 이동
  const handlePageSizeChange = (size: number) => {
    const firstIndex = (safePage - 1) * pageSize;
    setPageSize(size);
    setCurrentPage(Math.floor(firstIndex / size) + 1);
    scrollToTravelSection();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTravelSection();
  };

  // 플랜 목록 불러오기
  const fetchPlans = useCallback(() => {
    setIsLoading(true);
    getPlans()
      .then((res) => {
        if (res.error) {
          console.error("Error fetching plans:", res.error);
          setPlans([]);
          setTravels([]);
        } else {
          // console.log("Fetched plans:", res.data);
          setPlans(res.data);
          // 여행 일정 데이터 변환
          const travelEntries: TravelEntry[] = res.data.map((plan) => {
            if (plan.start_day && plan.end_day) {
              return { start_day: plan.start_day, end_day: plan.end_day };
            }
            // start_day와 end_day가 없는 경우 빈 문자열로 처리
            return { start_day: "", end_day: "" };
          });
          setTravels(travelEntries);
        }
        setIsPlansLoaded(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPlans();
  }, [fetchPlans]);

  // 방에서 나간 카드를 화면에서 즉시 제거하는 핸들러
  // 페이지 수가 줄어드는 경우는 safePage가 렌더 시점에 보정
  const handleLeaveSuccess = (leftPlanId: number) => {
    setPlans((prevPlans) => prevPlans.filter((p) => p.id !== leftPlanId));
  };

  return (
    <div className=" bg-[#FDFDFD] min-h-screen">
      <CreatePlanModal travels={travels} />
      <div className="min-w-300 w-300 mx-auto px-5 py-8">
        <div className="flex gap-5 h-fit mb-15">
          <div className="shrink-0 box w-[384px] px-9 pt-1 rounded-2xl shadow-[0px_4px_10px_0px_#b5b5b540]">
            <CalendarComponent travels={travels} />
            <div className="w-full h-px bg-border mt-2"></div>
            <div className="flex items-center gap-2 py-2 px-2.5 overflow-hidden">
              {/* 프로필 리스트 */}
              <MemberProfileList
                members={featuredPlan?.members}
                size={24}
                overlapMargin="-ml-2"
              />

              <Tag color="primary">{statusTagLabel}</Tag>

              {/* 여행 Title */}
              <div className="text-xs text-muted h-full truncate font-regular">
                {featuredPlan ? featuredPlan.title : "등록된 여행이 없습니다"}
              </div>
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
              className="absolute bottom-[-15%] left-[17%] w-[10%] h-auto -translate-y-1/2 origin-bottom animate-hum"
            />
            <Image
              src="/images/bara1.webp"
              alt="Bara Image"
              width={100}
              height={100}
              className="absolute bottom-[-15%] left-[30%] w-[10%] h-auto -translate-y-1/2 origin-bottom animate-nod"
            />
            <div className="absolute top-5.5 left-8 text-white font-jalnan text-2xl text-left leading-[1.4]">
              카피, 바라와 함께
              <br />
              여행 계획을 짜볼까요?
            </div>
            <div className="absolute top-24.5 left-8 text-white">
              친구들을 초대해 실시간으로 계획을 만들고 공유해봐요.
            </div>
            <div className="absolute top-5.5 right-8 bg-[#36B9FD] text-white rounded-full w-50 h-10 text-sm font-bold flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95">
              새 여행 일정 만들러 가기
            </div>
            <Image
              src="/images/cloud1.png"
              alt="Cloud Image"
              width={200}
              height={100}
              className="absolute top-[26%] left-[46%] w-[15%] h-auto -translate-y-1/2 animate-float [animation-delay:0s]"
            />
            <Image
              src="/images/cloud4.png"
              alt="Cloud Image"
              width={200}
              height={100}
              className="absolute top-[46%] right-[21%] w-[11%] h-auto -translate-y-1/2 animate-float [animation-delay:0.6s] [animation-duration:4.6s]"
            />
            <Image
              src="/images/cloud5.png"
              alt="Cloud Image"
              width={200}
              height={100}
              className="absolute top-[58%] left-[5%] w-[8%] h-auto -translate-y-1/2 animate-float [animation-delay:1.2s] [animation-duration:4.2s]"
            />
            <Image
              src="/images/cloud2.png"
              alt="Cloud Image"
              width={200}
              height={100}
              className="absolute top-[56%] left-[30%] w-[8%] h-auto -translate-y-1/2 animate-float [animation-delay:0.3s] [animation-duration:3.8s]"
            />
          </button>
        </div>
        <div ref={travelSectionRef} className="px-4 scroll-mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="text-2xl font-jalnan text-main mr-2">
                나의 여행
              </div>
              <Tag>{sortedPlans.length}개</Tag>
            </div>

            {/* 페이지당 카드 수 */}
            <div
              className={`flex items-center gap-1 ${sortedPlans.length === 0 ? "hidden" : ""}`}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <FilterButton
                  key={size}
                  isActive={size === pageSize}
                  onClick={() => handlePageSizeChange(size)}
                >
                  <span className="text-md font-jalnan">{size}개</span>
                </FilterButton>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 mt-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted">
                여행 목록을 불러오는 중이에요...
              </p>
            </div>
          ) : isPlansLoaded && sortedPlans.length === 0 ? (
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
                  variant={"round"}
                  className="px-10 mt-4 shadow-card"
                >
                  새 여행 일정 만들러 가기
                </MainButton>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-y-6 py-6 ">
              {pagedPlans.map((plan) => (
                <TravelCard
                  key={plan.id}
                  data={plan}
                  onLeave={handleLeaveSuccess}
                />
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pb-6">
              <button
                type="button"
                onClick={() => handlePageChange(safePage - 1)}
                disabled={safePage === 1}
                className="flex items-center justify-center w-8 h-8 rounded-full text-muted transition-colors hover:bg-border disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
                aria-label="이전 페이지"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    aria-current={page === safePage ? "page" : undefined}
                    className={`w-8 h-8 rounded-full text-sm cursor-pointer ${
                      page === safePage
                        ? "bg-primary text-white font-semibold"
                        : "text-muted hover:bg-border"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() => handlePageChange(safePage + 1)}
                disabled={safePage === totalPages}
                className="flex items-center justify-center w-8 h-8 rounded-full text-muted transition-colors hover:bg-border disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
                aria-label="다음 페이지"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MainPage() {
  return (
    <Suspense>
      <MainPageContent />
    </Suspense>
  );
}
