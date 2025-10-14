import { type NextRequest, NextResponse } from 'next/server';
import { isValidOrigin } from '@/shared/config/auth';
import getEnv from '@/shared/config/env';

export async function GET(request: NextRequest) {
  const { cookies, nextUrl } = request;
  const { searchParams } = nextUrl;
  const token = searchParams.get('token');
  const originURL = cookies.get('origin')?.value;
  const rt = cookies.get('rt')?.value;
  const { isStaging, stagingURL, prodURL } = getEnv();
  const redirectUrl = `/onboarding?token=${token}&rt=${rt}`;

  cookies.delete('origin');
  cookies.delete('rt');

  if (isStaging) {
    return originURL && isValidOrigin(originURL)
      ? NextResponse.redirect(`${originURL}${redirectUrl}`)
      : NextResponse.redirect(`${stagingURL}${redirectUrl}`);
  }

  return NextResponse.redirect(`${prodURL}${redirectUrl}`);
}
