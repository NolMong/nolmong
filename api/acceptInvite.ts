import { createClient } from '@/lib/supabase/client';

export async function acceptInvite(uuid: string) {
  const supabase = createClient();

  // 로그인 유저 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: '로그인이 필요한 서비스입니다.' };
  }

  // uuid로 plan_id 조회
  const { data: planData, error: planError } = await supabase
    .from('plans')
    .select('id')
    .eq('uuid', uuid)
    .maybeSingle();

  if (planError || !planData) {
    console.error('플랜 정보 조회 실패:', planError);
    return { success: false, message: '유효하지 않은 여행 계획입니다.' };
  }

  const planId = planData.id;

  // 이미 참여 중인지 확인
  const { data: existingMember } = await supabase
    .from('plan_profiles')
    .select('plan_id')
    .eq('plan_id', planId)
    .eq('profile_id', user.id)
    .maybeSingle();

  if (existingMember) {
    return {
      success: false,
      isAlreadyMember: true,
      message: '이미 참여 중인 여행 플랜입니다!',
    };
  }

  // plan_profiles 멤버 추가
  const { error: joinError } = await supabase.from('plan_profiles').insert({
    plan_id: planId,
    profile_id: user.id,
  });

  if (joinError) {
    console.error('플랜 참여 처리 실패:', joinError.message);
    return { success: false, message: '여행 플랜 참여에 실패했습니다.' };
  }

  return { success: true, message: '여행 플랜에 함께하게 되었습니다!' };
}
