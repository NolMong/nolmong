import { createClient } from '@/lib/supabase/client';
import { UserType, ProfileTheme } from '@/store/useUserStore';

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

export type MemberProfile = {
  id: string;
  features: [UserType, ProfileTheme];
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
  members?: MemberProfile[];
};

type RawPlanResponse = PlanType & {
  plan_profiles?:
    | {
        profiles: MemberProfile | null;
      }[]
    | null;
};

type PlanProfileRow = {
  plans: RawPlanResponse | RawPlanResponse[] | null;
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
    .select(
      `
      plans (
        *,
        plan_profiles (
          profiles (
            id,
            features
          )
        )
      )
    `,
    )
    .eq('profile_id', user.id)
    .order('created_at', { referencedTable: 'plans', ascending: false });

  if (error) {
    return { data: null, error };
  }

  const rawData = data as unknown as PlanProfileRow[];

  const plans: PlanType[] = rawData
    .flatMap((row) => {
      if (!row.plans) return [];
      return Array.isArray(row.plans) ? row.plans : [row.plans];
    })
    .filter((plan): plan is RawPlanResponse => plan !== null)
    .map((plan) => {
      const rawProfiles = plan.plan_profiles;
      const members: MemberProfile[] = Array.isArray(rawProfiles)
        ? rawProfiles
            .map((pp) => pp.profiles)
            .filter((p): p is MemberProfile => p !== null)
        : [];

      const { plan_profiles, ...cleanPlan } = plan;

      return {
        ...cleanPlan,
        cards: (cleanPlan.cards as CardType[]) || [],
        members,
      };
    });

  return { data: plans, error: null };
}
