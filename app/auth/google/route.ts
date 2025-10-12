import getEnv from '@/utils/env';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = searchParams.get('origin');
  const rt = searchParams.get('rt');
  const { isStaging, apiUrl } = getEnv();

  const response = NextResponse.redirect(`${apiUrl}/api/v1/auth/google`);

  if (isStaging && origin) {
    response.cookies.set('origin', origin, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 5,
      path: '/',
    });
  }

  if (rt) {
    response.cookies.set('rt', rt, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 5,
      path: '/',
    });
  }

  return response;
}
