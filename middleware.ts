import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 현재 세션 유저 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 누구나 접근 가능한 경로 ( landing or callback )
  const isPublicPath =
    pathname === '/landing' || pathname.startsWith('/auth/callback');

  // 비회원이 회원 경로로 진입할 때
  if (!user && !isPublicPath) {
    const landingUrl = new URL('/landing', request.url);

    // alert 메시지를 알리기 위해 쿼리 파라미터(unauthorized=true)를 붙여서 이동
    request.nextUrl.searchParams.forEach((value, key) => {
      landingUrl.searchParams.set(key, value);
    });

    landingUrl.searchParams.set('unauthorized', 'true');

    return NextResponse.redirect(landingUrl);
  }

  return response;
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
