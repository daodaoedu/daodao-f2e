import useSWRMutation from 'swr/mutation';
import contractDoneImg from '@/public/assets/images/email-contact.png';
import contractErrorImg from '@/public/assets/images/500-error.png';
import { Image } from '@/components/ui/image';
import { emailAPI, getEmailPathname, SendEmailSchema } from '@/services/emails';
import { useDialog } from '@/contexts/Dialog';

interface SendEmailProps {
  onSuccess?: () => void;
}

export const useSendEmail = ({ onSuccess }: SendEmailProps = {}) => {
  const { openDialog } = useDialog();

  return useSWRMutation<void, Error, string, SendEmailSchema>(
    getEmailPathname(),
    (key, { arg }) => emailAPI.send(arg),
    {
      onSuccess: () => {
        openDialog({
          title: '已送出邀請',
          content: (
            <>
              <Image src={contractDoneImg} alt="contract done" />
              <p>請耐心等候夥伴的回應</p>
            </>
          ),
          cancelBtnProps: { className: 'hidden' },
        });
        onSuccess?.();
      },
      onError: () => {
        openDialog({
          title: '哎呀！有不明錯誤',
          content: <Image src={contractErrorImg} alt="contract error" />,
          cancelBtnProps: { className: 'hidden' },
          confirmText: '再試一次',
        });
      },
    }
  );
};
