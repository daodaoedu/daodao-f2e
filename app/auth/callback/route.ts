import getEnv from '@/utils/env';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { cookies, nextUrl } = request;
  const { searchParams } = nextUrl;
  const token = searchParams.get('token');
  const origin = cookies.get('origin')?.value;
  const rt = cookies.get('rt')?.value;
  const { isStaging, stagingHostname, hostname } = getEnv();
  const redirectUrl = `/onboarding?token=${token}&rt=${rt}`;

  cookies.delete('origin');
  cookies.delete('rt');

  if (isStaging) {
    return origin
      ? NextResponse.redirect(`${origin}${redirectUrl}`)
      : NextResponse.redirect(`${stagingHostname}${redirectUrl}`);
  }

  return NextResponse.redirect(`${hostname}${redirectUrl}`);
}
