import { createClient } from '@/lib/supabase/client';

export async function updateSupabaseTitle({
  data,
}: {
  data: { planId: string; title: string };
}) {
  const supabase = createClient();
  console.log('updateSupabaseTitle called with data:', data);
  const { data: result, error } = await supabase
    .from('plans')
    .update({ title: data.title })
    .eq('uuid', data.planId);
  if (error) {
    console.error('계획 수정 실패:', error.message);
    return { data: null, error };
  }
  return { data: result, error: null };
}
