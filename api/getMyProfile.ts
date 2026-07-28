import { createClient } from "@/lib/supabase/client";
import { UserType, ProfileTheme } from "@/store/useUserStore";

// presence payload에 실을 내 정보 (editingCardId는 사용하는 쪽에서 채움)
export type MyProfile = {
  userId: string;
  name: string;
  character: UserType;
  theme: ProfileTheme;
};

// 로그인한 사용자의 표시용 정보를 모아서 반환.
// 이름은 auth의 카카오 메타데이터, 캐릭터/테마는 profiles.features에서 가져온다.
export async function getMyProfile(): Promise<MyProfile | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("name, features")
    .eq("id", user.id)
    .maybeSingle();

  // features는 [캐릭터, 테마] 형태. 아직 설정 전이면 기본값 사용
  const [character, theme] = Array.isArray(data?.features) ? data.features : [];

  return {
    userId: user.id,
    name: data?.name,
    character: (character as UserType) ?? "capi",
    theme: (theme as ProfileTheme) ?? "green",
  };
}
