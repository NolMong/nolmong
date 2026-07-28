'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Flag,
  Map,
  CircleDollarSign,
  PersonStanding,
  Check,
  Loader2,
} from 'lucide-react';
import { MainButton, TravelDateCalendar, LocationTag } from '@/components';
import { useModal } from '@/hooks/useModal';
import { useCreatePlanModalStore } from '@/store/useModalStore';
import ChooseLocation from './ChooseLocation';
import { postNewPlan } from '@/api/postNewPlan';

type LocationEntry = { text: string; editable: boolean };

function formatDisplayDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-');
  return `${year}.${month}.${day}`;
}

function handleWheelScroll(e: React.WheelEvent<HTMLDivElement>) {
  if (e.deltaY === 0) return;
  e.currentTarget.scrollLeft += e.deltaY;
}

const initialPlan = {
  startDate: '',
  endDate: '',
  startLocation: [] as LocationEntry[],
  endLocation: [
    // 예시임
    // { text: '서울', editable: false },
    // { text: '인천', editable: false },
  ] as LocationEntry[],
  budget: '',
  headcount: '',
};

// 체크박스 + 라벨 (당일치기 / 직접입력에서 공통으로 사용)
function LabeledCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className='flex gap-1.5 items-center cursor-pointer'>
      <div className='relative flex items-center justify-center'>
        <input
          type='checkbox'
          checked={checked}
          onChange={onChange}
          className='peer appearance-none w-4 h-4 rounded-sm border border-border checked:bg-primary checked:border-primary transition-colors cursor-pointer'
        />
        <Check
          size={12}
          strokeWidth={3}
          className='absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none'
        />
      </div>
      <span className='text-sm text-muted'>{label}</span>
    </label>
  );
}

// 여행 날짜 / 출발지 / 도착지 필드 행 wrapper (선택된 상태면 primary로 강조)
function PlanFieldRow({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex gap-4 items-center border rounded-lg px-4 h-12 transition-colors duration-200 cursor-pointer ${
        active ? 'border-primary text-primary' : 'border-border text-muted'
      }`}
    >
      {icon}
      {children}
    </div>
  );
}

// 출발지 / 도착지 공통: 가로 스크롤되는 LocationTag 목록 (없으면 안내 텍스트)
function LocationTagList({
  locations,
  emptyText,
  onAdd,
  onRemove,
  onTextChange,
}: {
  locations: LocationEntry[];
  emptyText: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onTextChange: (index: number, text: string) => void;
}) {
  return (
    <div
      onWheel={handleWheelScroll}
      className='flex flex-1 min-w-0 gap-1 overflow-x-auto scrollbar-hide'
    >
      {locations.length === 0 ? (
        <div className='text-muted'>{emptyText}</div>
      ) : (
        locations.map((location, index) => (
          <LocationTag
            key={index}
            text={location.text}
            status={location.editable ? 'editable' : 'fixed'}
            onAdd={onAdd}
            onClick={() => onRemove(index)}
            onTextChange={(text) => onTextChange(index, text)}
          />
        ))
      )}
    </div>
  );
}

// renderContent()의 "제목 + 스크롤 영역" 공통 레이아웃
function PanelSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className='font-jalnan text-2xl text-brown-light mb-6'>{title}</div>
      <div className='h-140 overflow-y-auto scrollbar-thin pr-2'>
        {children}
      </div>
    </div>
  );
}

export default function CreatePlanModal({
  travels,
}: {
  travels: (string | { start_day: string; end_day: string })[];
}) {
  const isOpen = useCreatePlanModalStore((state) => state.isOpen);
  const closeStore = useCreatePlanModalStore((state) => state.close);
  const router = useRouter();

  const [oneDayTrip, setOneDayTrip] = useState(false);
  const [writeStartLocation, setWriteStartLocation] = useState(false);
  const [writeEndLocation, setWriteEndLocation] = useState(false);
  const [state, setState] = useState(
    'date' as 'date' | 'startLocation' | 'endLocation',
  );
  const [plan, setPlan] = useState(initialPlan);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 정상적으로 닫힐 때(배경 클릭, 라우트 이동, 완료 버튼 등) plan을 처음 상태로 초기화
  const close = useCallback(() => {
    setPlan(initialPlan);
    setOneDayTrip(false);
    setWriteStartLocation(false);
    setWriteEndLocation(false);
    setState('date');
    setIsSubmitting(false);
    closeStore();
  }, [closeStore]);

  const { rendered, visible, handleTransitionEnd } = useModal(isOpen, close);

  if (!rendered) return null;

  const handleToggleOneDayTrip = () => {
    const turningOn = !oneDayTrip;
    setOneDayTrip(turningOn);
    if (turningOn) {
      setPlan((prev) => ({ ...prev, startDate: '', endDate: '' }));
    }
  };

  // ChooseLocation에서 고른 도시(직접입력 아님)만 대체, 직접입력으로 추가된 항목은 그대로 유지
  const handleSelectStartLocation = (city: string) => {
    setPlan((prev) => ({
      ...prev,
      startLocation: [{ text: city, editable: false }],
    }));
  };

  const handleSelectEndLocation = (cities: string[]) => {
    setPlan((prev) => {
      const editableEntries = prev.endLocation.filter((l) => l.editable);
      const picked = cities.map((text) => ({ text, editable: false }));
      if (picked.length + editableEntries.length > 3) {
        alert('여행지는 최대 3곳까지 선택 가능합니다.');
        return prev;
      }
      return { ...prev, endLocation: [...picked, ...editableEntries] };
    });
  };

  const handleChangeDate = (range: { startDay: string; endDay: string }) => {
    setPlan((prev) => ({
      ...prev,
      startDate: range.startDay,
      endDate: range.endDay,
    }));
  };

  const handleAddStartLocation = () => {
    alert('출발지는 최대 한 곳까지 선택 가능합니다.');
  };

  const handleAddEndLocation = () => {
    if (plan.endLocation.length >= 3) {
      alert('여행지는 최대 3곳까지 선택 가능합니다.');
      return;
    }
    setPlan((prev) => ({
      ...prev,
      endLocation: [...prev.endLocation, { text: '', editable: true }],
    }));
  };

  const handleChangeStartLocationText = (index: number, text: string) => {
    setPlan((prev) => ({
      ...prev,
      startLocation: prev.startLocation.map((l, i) =>
        i === index ? { ...l, text } : l,
      ),
    }));
  };

  const handleChangeEndLocationText = (index: number, text: string) => {
    setPlan((prev) => ({
      ...prev,
      endLocation: prev.endLocation.map((l, i) =>
        i === index ? { ...l, text } : l,
      ),
    }));
  };

  const handleRemoveStartLocation = (index: number) => {
    setPlan((prev) => {
      const startLocation = prev.startLocation.filter((_, i) => i !== index);
      if (!startLocation.some((l) => l.editable)) {
        setWriteStartLocation(false);
      }
      return { ...prev, startLocation };
    });
  };

  const handleRemoveEndLocation = (index: number) => {
    setPlan((prev) => {
      const endLocation = prev.endLocation.filter((_, i) => i !== index);
      if (!endLocation.some((l) => l.editable)) {
        setWriteEndLocation(false);
      }
      return { ...prev, endLocation };
    });
  };

  const handleToggleWriteStartLocation = () => {
    const turningOn = !writeStartLocation;
    if (!turningOn) {
      setWriteStartLocation(false);
      setPlan((prev) => ({
        ...prev,
        startLocation: prev.startLocation.filter((l) => !l.editable),
      }));
      return;
    }
    if (plan.startLocation.length >= 1) {
      alert('출발지는 최대 한 곳까지 선택 가능합니다.');
      return;
    }
    setWriteStartLocation(true);
    setPlan((prev) => ({
      ...prev,
      startLocation: [...prev.startLocation, { text: '', editable: true }],
    }));
  };

  const handleToggleWriteEndLocation = () => {
    const turningOn = !writeEndLocation;
    if (!turningOn) {
      setWriteEndLocation(false);
      setPlan((prev) => ({
        ...prev,
        endLocation: prev.endLocation.filter((l) => !l.editable),
      }));
      return;
    }
    if (plan.endLocation.length >= 3) {
      alert('여행지는 최대 3곳까지 선택 가능합니다.');
      return;
    }
    setWriteEndLocation(true);
    setPlan((prev) => ({
      ...prev,
      endLocation: [...prev.endLocation, { text: '', editable: true }],
    }));
  };

  const handleChangeBudget = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
    setPlan((prev) => ({
      ...prev,
      budget: digitsOnly ? Number(digitsOnly).toLocaleString() : '',
    }));
  };

  const handleChangeHeadcount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlan((prev) => ({ ...prev, headcount: e.target.value }));
  };

  const handleSubmit = async () => {
    if (plan.startDate === '' || plan.endDate === '') {
      alert('여행 날짜를 선택해주세요.');
      return;
    }
    if (plan.startLocation.length === 0) {
      alert('출발지를 선택해주세요.');
      return;
    }
    if (plan.endLocation.length === 0) {
      alert('도착지를 선택해주세요.');
      return;
    }

    const confirmed = confirm(
      '여행 계획을 생성하시겠습니까?\n여행일 : ' +
        plan.startDate +
        ' ~ ' +
        plan.endDate +
        '\n출발지: ' +
        plan.startLocation.map((l) => l.text).join(', ') +
        '\n도착지: ' +
        plan.endLocation.map((l) => l.text).join(', ') +
        '\n예산: ' +
        (plan.budget ? plan.budget + '원' : '미정') +
        '\n인원: ' +
        (plan.headcount ? plan.headcount + '명' : '미정'),
    );
    if (!confirmed) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error, channel } = await postNewPlan({
        startLocation: plan.startLocation[0]?.text ?? '',
        endLocations: plan.endLocation.map((l) => l.text),
        start_day: plan.startDate,
        end_day: plan.endDate,
        budget: plan.budget,
        headcount: plan.headcount,
      });

      if (error) {
        alert('여행 계획 생성에 실패했습니다.');
        return;
      }

      alert('여행 계획이 생성되었습니다.');
      close();
      if (channel) {
        router.push(`/plan/${channel}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (state === 'date') {
      return (
        <div className='w-112.75'>
          <div className='font-jalnan text-2xl text-brown-light mb-6'>
            여행 날짜
          </div>
          <div className='h-140'>
            <TravelDateCalendar
              startDay={plan.startDate}
              endDay={plan.endDate}
              oneDayTrip={oneDayTrip}
              onChange={handleChangeDate}
              travels={travels}
            />
          </div>
        </div>
      );
    } else if (state === 'startLocation') {
      return (
        <PanelSection title='출발지'>
          <ChooseLocation
            selectedCity={
              plan.startLocation.find((l) => !l.editable)?.text ?? ''
            }
            onSelect={handleSelectStartLocation}
          />
        </PanelSection>
      );
    } else if (state === 'endLocation') {
      return (
        <PanelSection title='여행지'>
          <ChooseLocation
            multiple
            selectedCities={plan.endLocation
              .filter((l) => !l.editable)
              .map((l) => l.text)}
            onSelect={handleSelectEndLocation}
          />
        </PanelSection>
      );
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={() => {
        if (isSubmitting) return;
        close();
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        className='bg-white p-12 rounded-lg flex flex-col gap-4  shadow-[0px_4px_10px_0px_#525252]'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='font-jalnan text-[32px] text-brown mb-8'>여행 일정</div>
        <div className='flex gap-4'>
          {renderContent()}
          <div className='w-[384px] flex flex-col'>
            <div className='w-full shrink-0 font-jalnan text-2xl text-brown-light mb-6'>
              여행 정보
            </div>

            <div className='w-full flex flex-col gap-4'>
              {/* 여행 날짜 */}
              <PlanFieldRow
                active={state === 'date'}
                onClick={() => setState('date')}
                icon={<CalendarDays width={20} height={20} />}
              >
                <div
                  className={`flex-1 h-12 flex items-center ${plan.startDate ? 'text-main' : 'text-muted'}`}
                >
                  {!plan.startDate
                    ? '여행 날짜를 선택해 주세요'
                    : !plan.endDate || plan.startDate === plan.endDate
                      ? formatDisplayDate(plan.startDate)
                      : `${formatDisplayDate(plan.startDate)} ~ ${formatDisplayDate(plan.endDate)}`}
                </div>
                <LabeledCheckbox
                  checked={oneDayTrip}
                  onChange={handleToggleOneDayTrip}
                  label='당일치기'
                />
              </PlanFieldRow>

              {/* 출발지 */}
              <PlanFieldRow
                active={state === 'startLocation'}
                onClick={() => setState('startLocation')}
                icon={<Flag width={20} height={20} />}
              >
                <LocationTagList
                  locations={plan.startLocation}
                  emptyText='출발지를 선택해주세요'
                  onAdd={handleAddStartLocation}
                  onRemove={handleRemoveStartLocation}
                  onTextChange={handleChangeStartLocationText}
                />
                <LabeledCheckbox
                  checked={writeStartLocation}
                  onChange={handleToggleWriteStartLocation}
                  label='직접입력'
                />
              </PlanFieldRow>

              {/* 도착지 */}
              <PlanFieldRow
                active={state === 'endLocation'}
                onClick={() => setState('endLocation')}
                icon={<Map width={20} height={20} />}
              >
                <LocationTagList
                  locations={plan.endLocation}
                  emptyText='도착지를 선택해주세요 (최대 3곳)'
                  onAdd={handleAddEndLocation}
                  onRemove={handleRemoveEndLocation}
                  onTextChange={handleChangeEndLocationText}
                />
                <LabeledCheckbox
                  checked={writeEndLocation}
                  onChange={handleToggleWriteEndLocation}
                  label='직접입력'
                />
              </PlanFieldRow>

              {/* 예산 / 인원 */}
              <div className='w-full flex gap-2'>
                <div className='flex-1 min-w-0 flex gap-4 items-center border border-border rounded-lg px-4 h-12 text-muted focus-within:border-primary focus-within:text-primary transition-colors duration-200 cursor-pointer'>
                  <CircleDollarSign
                    width={20}
                    height={20}
                    className='shrink-0'
                  />
                  <input
                    className='border border-none focus:outline-none h-12 text-main min-w-0'
                    placeholder='예산 (선택)'
                    value={plan.budget}
                    onChange={handleChangeBudget}
                  />
                  <div className='shrink-0 text-main'>원</div>
                </div>
                <div className='flex-1 min-w-0 flex gap-4 items-center border border-border rounded-lg px-4 h-12 text-muted focus-within:border-primary focus-within:text-primary transition-colors duration-200 cursor-pointer'>
                  <PersonStanding width={20} height={20} className='shrink-0' />
                  <input
                    className='border border-none focus:outline-none h-12 text-main min-w-0'
                    placeholder='인원 (선택)'
                    onChange={handleChangeHeadcount}
                  />
                  <div className='shrink-0 text-main'>명</div>
                </div>
              </div>
            </div>
            <MainButton
              onClick={handleSubmit}
              variant='fill'
              disabled={isSubmitting}
              style={{
                fontWeight: 700,
                marginTop: 'auto',
                marginLeft: 'auto',
                width: 'fit-content',
              }}
            >
              {isSubmitting ? (
                <span className='flex items-center gap-1.5'>
                  <Loader2 size={16} className='animate-spin' />
                  생성 중...
                </span>
              ) : (
                '여행 시작'
              )}
            </MainButton>
          </div>
        </div>
      </div>
    </div>
  );
}
