import { type NextRequest, NextResponse } from 'next/server';
import { isValidOrigin } from '@/shared/config/auth';
import getEnv from '@/shared/config/env';

export async function GET(request: NextRequest) {
  const { cookies, nextUrl } = request;
  const { searchParams } = nextUrl;
  const token = searchParams.get('token');
  const originURL = cookies.get('origin')?.value;
  const { isProduction } = getEnv();
  const rt = cookies.get('rt')?.value;
  const redirectSearchParams = new URLSearchParams();

  cookies.delete('origin');
  cookies.delete('rt');

  if (token) redirectSearchParams.set('token', token);
  if (rt) redirectSearchParams.set('rt', rt);

  const redirectTo = `/auth/success?${redirectSearchParams}`;

  return !isProduction && originURL && isValidOrigin(originURL)
    ? NextResponse.redirect(`${originURL}${redirectTo}`)
    : NextResponse.redirect(redirectTo);
}
