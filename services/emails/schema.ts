import { z } from 'zod';

export const sendEmailSchema = z.object({
  userId: z.string(),
  url: z.string().url(),
  name: z.string(),
  roleList: z.array(z.string()),
  photoUrl: z.string().url().optional().nullable(),
  from: z.string().email({ message: '無效的 Email 格式' }),
  to: z.string().email({ message: '無效的 Email 格式' }),
  title: z.string(),
  subject: z.string(),
  activityTitle: z.string().optional().nullable(),
  text: z.string().min(1, { message: '訊息不能為空' }),
  information: z.array(z.string()),
});

export const contactFormSchema = z.object({
  message: z.string().min(1, { message: '訊息內容不能為空' }),
  contact: z.string().min(1, { message: '聯絡資訊不能為空' }),
  terms: z.literal(true, {
    errorMap: () => ({ message: '您必須同意使用者條款才能寄送' }),
  }),
});

export type SendEmailSchema = z.infer<typeof sendEmailSchema>;
export type ContactFormSchema = z.infer<typeof contactFormSchema>;
