'use client';

import { useState } from 'react';
import { CustomLink } from '@/shared/ui/custom-link';
import { User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import {
  ResponsiveModal,
  ResponsiveModalSize,
} from '@/shared/ui/responsive-modal';
import ChatSvg from '@/public/assets/icons/chat.svg';
import { AuthButton, useAuth } from '@/features/auth';
import { Textarea } from '@/shared/ui/textarea';
import { ROLE } from '@/constants/member';
import { contactFormSchema, ContactFormSchema } from '@/services/emails';
import { getOptionLabel } from '@/utils/option';
import { useSendEmail } from '../hooks';

export type TargetUserType = {
  id: string;
  email: string;
  photoURL: string;
  name: string;
  roleList: string[];
};

interface ContactModalProps {
  targetUser: TargetUserType;
  emailTitle: string;
  emailSubject: string;
  modalTitle: string;
  description: string;
  descriptionPlaceholder: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const TermsDescription = () => (
  <p className="text-sm text-gray-500">
    您填的資訊將透過島島阿學 email
    給這位夥伴，請確認訊息未涉及個人隱私並符合本網站
    {' '}
    <CustomLink
      href="/terms/service"
      target="_blank"
      className="underline hover:text-primary"
    >
      使用者條款
    </CustomLink>
  </p>
);

export const ContactModal = ({
  targetUser,
  modalTitle,
  emailTitle,
  emailSubject,
  description,
  descriptionPlaceholder,
  onCancel,
  onSuccess,
}: ContactModalProps) => {
  const { user: me } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<ContactFormSchema>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      message: '',
      contact: '',
      terms: undefined,
    },
  });

  const handleClose = () => {
    form.reset();
    setIsOpen(false);
    onCancel?.();
  };

  const { trigger, isMutating } = useSendEmail({
    onSuccess: () => {
      onSuccess?.();
      form.reset();
      setIsOpen(false);
    },
  });

  const handleValidSubmit = (data: ContactFormSchema) => {
    if (!me || !me.email || !me.id || !me.roleList || !me.name) return;

    trigger({
      userId: me.id,
      url: `${window.location.origin}/partner/${me.id}`,
      name: me.name,
      roleList: me.roleList,
      photoUrl: me.photoURL,
      from: me.email,
      to: targetUser.email,
      title: emailTitle,
      subject: emailSubject,
      activityTitle: modalTitle,
      text: data.message,
      information: [me.email, data.contact],
    });
  };

  return (
    <>
      <AuthButton size="lg" onClick={() => setIsOpen(true)}>
        <ChatSvg />
        {modalTitle}
      </AuthButton>
      <ResponsiveModal
        open={isOpen}
        onClose={handleClose}
        title={modalTitle}
        hasCloseButton
        className="md:max-w-xl"
        size={ResponsiveModalSize.Medium}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleValidSubmit)}
            className="flex w-full flex-col gap-4"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-primary-lightest p-3">
              <Avatar className="size-12">
                <AvatarImage
                  src={targetUser?.photoURL}
                  alt={`${targetUser?.name} avatar`}
                />
                <AvatarFallback>
                  <User className="text-gray-400" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-800">{targetUser.name}</p>
                <p className="text-sm text-gray-600">
                  {getOptionLabel(ROLE, targetUser.roleList?.[0] || '', '暫無資料')}
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block font-medium text-gray-800">
                    {description}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={descriptionPlaceholder}
                      className="min-h-[128px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 block font-medium text-gray-800">
                    聯絡資訊
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="寫下您的聯絡資訊，初次聯繫建議提供「想公開的社群媒體帳號、email」即可。"
                      className="min-h-[128px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal">
                      <TermsDescription />
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div className="mt-2 flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-full shadow-sm"
                disabled={isMutating}
                onClick={handleClose}
              >
                取消
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-full"
                disabled={isMutating || form.formState.isSubmitting}
              >
                送出
              </Button>
            </div>
          </form>
        </Form>
      </ResponsiveModal>
    </>
  );
};
