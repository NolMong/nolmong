import { createClient } from '@/lib/supabase/client';
import { getAblyClient } from '@/lib/ably/client';
import type { ChannelOptions } from 'ably';

export type NewPlanType = {
  startLocation: string;
  endLocations: string[];
  budget: string; // '1,000,000' 같은 콤마 포맷 문자열 또는 빈 문자열
  headcount: string;
};

const PLAN_CHANNEL_OPTIONS: ChannelOptions = {
  modes: ['OBJECT_SUBSCRIBE', 'OBJECT_PUBLISH'],
};

export async function postNewPlan(plan: NewPlanType) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: new Error('로그인이 필요합니다.'),
      channel: null,
    };
  }

  console.log('로그인 유저 정보:', user);

  const title = `${plan.endLocations.join(' ')} 여행`;
  const uuid = crypto.randomUUID();

  // plan과 같은 uuid로 Ably 채널을 만들고, cards를 담을 자리(LiveMap)를 초기 상태로 세팅
  const ably = getAblyClient();
  const channel = ably.channels.get(`${uuid}`, PLAN_CHANNEL_OPTIONS);
  const root = await channel.object.get();
  if (!root) {
    return {
      data: null,
      error: new Error('Ably 채널 생성 실패'),
      channel: null,
    };
  }
  await root.set('cards', []);
  await root.set('title', title);

  console.log('Ably 채널 생성 완료:', title, uuid, plan);

  const { data: newPlanData, error: newPlanError } = await supabase
    .from('plans')
    .insert({
      // Ably 실시간 협업 채널 이름으로 쓰는 uuid
      uuid: uuid,
      title,
      start_location: plan.startLocation,
      end_locations: plan.endLocations,
      budget: plan.budget === '' ? 0 : Number(plan.budget.replaceAll(',', '')),
      headcount:
        plan.headcount === '' ? 0 : Number(plan.headcount.replaceAll(',', '')),
      cards: [],
    })
    .select()
    .single();

  if (newPlanError) {
    return { data: null, error: newPlanError, channel: null };
  }

  // plan_profiles.plan_id는 plans의 정수 PK(id)를 참조함 (Ably 채널용 uuid 아님)
  const { data: newPlanProfilesData, error: newPlanProfilesError } =
    await supabase
      .from('plan_profiles')
      .insert({
        plan_id: newPlanData.id,
        profile_id: user.id,
      })
      .select()
      .single();

  if (newPlanProfilesError) {
    return { data: null, error: newPlanProfilesError, channel: null };
  }

  return {
    data: { newPlanData, newPlanProfilesData },
    error: null,
    channel: uuid,
  };
}
