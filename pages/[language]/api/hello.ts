import getEnv from '@/utils/env';
import { NextResponse } from 'next/server';

export const runtime = 'experimental-edge';

export default function handler() {
  const nextResponse = NextResponse.next();
  nextResponse.cookies.set('test', 'test', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 30,
  });
  return NextResponse.redirect(new URL('/auth/google', getEnv().apiUrl));
}
