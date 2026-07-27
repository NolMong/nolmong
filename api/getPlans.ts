import { createClient } from '@/lib/supabase/client';

export type CardType = {
  id: string;
  x: number;
  y: number;
  day: string;
  name: string;
  type: string;
  order: number;
  address: string;
  category: string;
};

export type PlanType = {
  id: number;
  uuid: string;
  title: string;
  start_location: string;
  end_locations: string[];
  start_day: string;
  end_day: string;
  budget: number;
  headcount: number;
  cards: unknown[];
  created_at: string;
  updated_at: string;
};

// plan_profiles에서 로그인한 유저(profile_id = user.id)와 연결된 plans를 전부 가져옴
export async function getPlans() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('로그인이 필요합니다.') };
  }

  const { data, error } = await supabase
    .from('plan_profiles')
    .select('plans(*)')
    .eq('profile_id', user.id)
    .order('created_at', { referencedTable: 'plans', ascending: false });

  if (error) {
    return { data: null, error };
  }

  const plans = data
    .map((row) => row.plans as unknown as PlanType | null)
    .filter((plan): plan is PlanType => plan !== null);

  return { data: plans, error: null };
}
