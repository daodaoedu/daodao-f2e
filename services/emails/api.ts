import { ZodError } from 'zod';

import { HttpError, mutations } from '@/shared/lib/http';

import { sendEmailSchema, SendEmailSchema } from './schema';

export const getEmailPathname = () => '/emails';

interface EmailAPIType {
  send: (source: SendEmailSchema) => Promise<void>;
}

export const emailAPI: EmailAPIType = {
  send: (source) => {
    try {
      const request = sendEmailSchema.parse(source);

      return mutations.post(getEmailPathname(), request);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        throw new HttpError(400, { message: error.issues[0].message });
      }
      throw new HttpError(400, {
        message: '信件發送失敗，請稍後再試！',
      });
    }
  },
};
