import { Skeleton } from '@/components/common/Skeleton';

export default function WishlistSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* 상단 가로 스크롤 Day 카드 3개 예시 */}
      <div className="flex gap-5 h-120 p-2 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-72 h-full bg-gray-100 border border-gray-200 rounded-xl p-4 shrink-0 space-y-3"
          >
            <Skeleton className="h-6 w-24 bg-gray-200 rounded" />
            <Skeleton className="h-4 w-32 bg-gray-200 rounded" />
            <div className="space-y-2 pt-4">
              <Skeleton className="h-14 w-full bg-white rounded-lg" />
              <Skeleton className="h-14 w-full bg-white rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* 하단 후보 장소 리스트 스켈레톤 */}
      <div className="mt-5 p-2 border border-gray-200 rounded-xl bg-gray-50 h-36">
        <Skeleton className="h-5 w-36 bg-gray-200 rounded mb-3" />
        <div className="flex gap-3">
          <Skeleton className="h-16 w-48 bg-white rounded-lg" />
          <Skeleton className="h-16 w-48 bg-white rounded-lg" />
        </div>
      </div>
    </div>
  );
}
