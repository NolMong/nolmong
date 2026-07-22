import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // console.log('Callback 진입 URL params code:', code ? '있음' : '없음');

  if (code) {
    const cookieStore = await cookies();

    // 기본 이동은 /main 으로 설정
    let response = NextResponse.redirect(`${origin}/main`);

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
            });
            response = NextResponse.redirect(`${origin}/main`, {
              headers: request.headers,
            });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
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

      // console.log('DB 조회 결과 profile:', profile);

      // profiles 테이블에 없는 유저는 신규 저장 및 travel-test로 이동
      if (!profile) {
        // console.log('profile 없음 -> /travel-test 이동');
        const testRedirect = NextResponse.redirect(`${origin}/travel-test`);
        response.cookies.getAll().forEach((cookie) => {
          testRedirect.cookies.set(cookie.name, cookie.value, cookie);
        });
        return testRedirect;
      }

      // profiles 테이블에 기존 유저는 /main 으로 이동!
      // console.log('profile 있음 -> /main 이동');
      const mainRedirect = NextResponse.redirect(`${origin}/main`);
      response.cookies.getAll().forEach((cookie) => {
        mainRedirect.cookies.set(cookie.name, cookie.value, cookie);
      });
      return mainRedirect;
    }
  }

  return NextResponse.redirect(`${origin}/landing`);
}
