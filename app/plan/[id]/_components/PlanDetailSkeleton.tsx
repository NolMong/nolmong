import { Skeleton } from '@/components/common/Skeleton';

export default function PlanDetailsSkeleton() {
  return (
    <div className="flex gap-5 h-161 animate-pulse">
      {/* Day 선택 + PlanEditorCard 영역 */}
      <div className="flex flex-col gap-5 h-full w-107.5">
        {/* Day 탭 버튼 스켈레톤 */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 bg-gray-200 rounded-full" />
          <Skeleton className="h-9 w-20 bg-gray-200 rounded-full" />
          <Skeleton className="h-9 w-20 bg-gray-200 rounded-full" />
        </div>

        {/* 타임라인 카드 박스 스켈레톤 */}
        <div className="flex-1 bg-white border border-gray-100 rounded-lg p-5 space-y-4 shadow-card">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <Skeleton className="h-6 w-32 bg-gray-200 rounded" />
            <Skeleton className="h-6 w-16 bg-gray-200 rounded" />
          </div>

          {/* 타임라인 장소 카드 3개 예시 */}
          <div className="space-y-3 pt-2">
            <Skeleton className="h-16 w-full bg-gray-100 rounded-md" />
            <Skeleton className="h-16 w-full bg-gray-100 rounded-md" />
            <Skeleton className="h-16 w-full bg-gray-100 rounded-md" />
          </div>
        </div>
      </div>

      {/* 지도 영역 스켈레톤 */}
      <div className="flex-1 h-178.5 bg-gray-200 rounded-lg -mt-17.5 overflow-hidden relative">
        <Skeleton className="w-full h-full bg-gray-200" />

        {/* 지도 위 검색바 */}
        <div className="absolute top-2.5 left-2.5 w-[calc(100%-20px)]">
          <Skeleton className="h-11 w-full bg-white/80 rounded-full" />
        </div>
      </div>
    </div>
  );
}
