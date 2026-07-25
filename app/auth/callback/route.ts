import { NextResponse } from 'next/server';
import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 쿠키 보관용 인터페이스 정의
interface PendingCookie {
  name: string;
  value: string;
  options: CookieOptions;
}

// 환경 Base URL 설정
function getBaseUrl() {
  if (process.env.NODE_ENV === 'production') {
    // Vercel 환경변수로 지정한 커스텀 도메인 우선 사용
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
    }

    return 'https://nolmong.vercel.app';
  }

  // 로컬 개발 환경
  return 'http://localhost:3000';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const invite = searchParams.get('invite');

  // base url 구하기 (로컬 버셀)
  const baseUrl = getBaseUrl();

  const rawNext =
    searchParams.get('next') || searchParams.get('redirectTo') || '/main';

  const validNextPath =
    rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/main';

  const targetMainUrl = new URL(validNextPath, baseUrl);

  const inviteUuid = targetMainUrl.searchParams.get('invite');

  if (code) {
    const cookieStore = await cookies();
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
      return NextResponse.redirect(`${baseUrl}/landing?error=auth_failed`);
    }

    if (data.user) {
      const user = data.user;

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
        const testRedirectUrl = new URL('/travel-test', baseUrl);

        // travel-test가 끝난 뒤 가야 할 최종 목적지 저장 (/main?invite=xxx)
        testRedirectUrl.searchParams.set(
          'next',
          targetMainUrl.pathname + targetMainUrl.search,
        );

        // 만약의 상황을 대비해 invite 키 챙김
        if (inviteUuid) {
          testRedirectUrl.searchParams.set('invite', inviteUuid);
        }

        const testRedirect = NextResponse.redirect(testRedirectUrl.toString());
        pendingCookies.forEach(({ name, value, options }) => {
          testRedirect.cookies.set(name, value, options);
        });
        return testRedirect;
      }

      // 기존 유저 -> targetMainUrl (즉, /main?invite=xxx) 로 이동
      const mainRedirect = NextResponse.redirect(targetMainUrl.toString());
      pendingCookies.forEach(({ name, value, options }) => {
        mainRedirect.cookies.set(name, value, options);
      });
      return mainRedirect;
    }
  }

  return NextResponse.redirect(`${baseUrl}/landing`);
}
