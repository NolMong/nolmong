import { createClient } from '@/lib/supabase/client';

export async function deletePlan(planId: number) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('로그인이 필요합니다.') };
  }

  const { error } = await supabase
    .from('plan_profiles')
    .delete()
    .eq('plan_id', planId)
    .eq('profile_id', user.id);

  if (error) {
    console.error('방 나가기 실패:', error.message);
    return { error };
  }

  return { error: null };
}
