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
    return { data: null, error: new Error('로그인이 필요합니다.') };
  }

  const title = `${plan.endLocations.join(' ')} 여행`;
  const uuid = crypto.randomUUID();

  // plan과 같은 uuid로 Ably 채널을 만들고, cards를 담을 자리(LiveMap)를 초기 상태로 세팅
  const ably = getAblyClient();
  const channel = ably.channels.get(`${uuid}`, PLAN_CHANNEL_OPTIONS);
  const root = await channel.object.get();
  if (!root) {
    return { data: null, error: new Error('Ably 채널 생성 실패') };
  }
  await root.set('cards', []);
  await root.set('title', title);

  console.log('Ably 채널 생성 완료:', title, uuid, plan);

  const { data, error } = await supabase
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

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}
