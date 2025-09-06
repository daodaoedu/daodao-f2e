import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';
import getEnv from '@/utils/env';

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.set('test', 'test', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 30,
  });
  return redirect(`${getEnv().apiUrl}/auth/google`);
}
