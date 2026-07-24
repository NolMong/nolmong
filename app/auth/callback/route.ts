import { NextResponse } from 'next/server';
import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 쿠키 보관용 인터페이스 정의
interface PendingCookie {
  name: string;
  value: string;
  options: CookieOptions;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // 로그인 후 이동할 목적지 주소
  const next =
    searchParams.get('next') || searchParams.get('redirectTo') || '/main';

  if (code) {
    const cookieStore = await cookies();

    // 임시 쿠키 수집용 배열
    const pendingCookies: PendingCookie[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
              pendingCookies.push({ name, value, options });
            });
          },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('세션 교환 실패 에러:', error.message);
      return NextResponse.redirect(`${origin}/landing?error=auth_failed`);
    }

    if (data.user) {
      const user = data.user;

      // profiles 테이블 조회
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('profiles 조회 실패 에러:', profileError.message);
      }

      // 신규 유저 -> /travel-test 이동
      if (!profile) {
        const testRedirect = NextResponse.redirect(`${origin}/travel-test`);
        pendingCookies.forEach(({ name, value, options }) => {
          testRedirect.cookies.set(name, value, options);
        });
        return testRedirect;
      }

      // 기존 유저 -> next(초대 링크 주소 or /main)로 이동
      const redirectUrl = next.startsWith('http') ? next : `${origin}${next}`;

      const mainRedirect = NextResponse.redirect(redirectUrl);
      pendingCookies.forEach(({ name, value, options }) => {
        mainRedirect.cookies.set(name, value, options);
      });
      return mainRedirect;
    }
  }

  return NextResponse.redirect(`${origin}/landing`);
}
