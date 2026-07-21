import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/main';

  if (code) {
    const cookieStore = await cookies();

    // NextResponse 객체를 미리 만들어 쿠키 변경 사항을 응답 헤더에 세팅
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
                response.cookies.set(name, value, options);
              });
            } catch {
              // Server Component 예외 처리
            }
          },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    // 에러가 발생한 경우
    if (error) {
      console.error(
        'Supabase DB 유저 생성 및 세션 교환 실패:',
        error.message,
        error,
      );
      return NextResponse.redirect(`${origin}/`);
    }

    // 성공한 경우
    console.log('DB 유저 생성 성공 유저 정보:', data.user);
    return response;
  }

  // 에러 발생 시 메인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/`);
}
