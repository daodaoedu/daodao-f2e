import { useRouter } from 'next/router';
import { useDialog } from '@/contexts/Dialog';
import { useCallback } from 'react';
import { Image } from '@/components/ui/image';
import { useAuth } from '@/contexts/Auth';

export const useRegisterSuccessDialog = () => {
  const router = useRouter();
  const { openDialog } = useDialog();

  return useCallback(() => {
    openDialog({
      title: '帳號註冊成功！',
      content: (
        <>
          <p className="body-sm mb-6 mt-2 text-center text-basic-400">
            記得到信箱確認收到帳號驗證信件，並點選驗證Email按鈕，如果沒有看到信件，可以到垃圾桶確認。
          </p>
          <Image
            src="/assets/images/social-validation.png"
            alt="dao-dao-island"
            width={272}
            height={211}
          />
          <p className="body-sm my-6 text-center text-basic-400">
            我們會公開你的
            <strong className="font-bold">個人檔案</strong>
            ，填寫完整的資料，才能讓其他夥伴們更了解你喔！
          </p>
        </>
      ),
      cancelText: '暫時不需要',
      confirmText: '想，填寫資料',
      onConfirm: () => {
        router.replace('/personal-card');
      },
    });
  }, [openDialog, router]);
};

export const useVerifiedSuccessDialog = () => {
  const router = useRouter();
  const { isComplete } = useAuth();
  const { openDialog } = useDialog();

  return useCallback(() => {
    openDialog({
      title: '驗證成功',
      content: (
        <>
          <Image
            src="/assets/images/review-passed.png"
            alt="verified-success"
            width={272}
            height={262}
          />
          <p className="body-sm mb-6 text-center text-basic-400">
            {isComplete ? (
              <span>帳號已驗證成功，快來體驗平台的特色功能！</span>
            ) : (
              <span>
                我們會公開你的
                <strong className="font-bold">個人檔案</strong>
                ，填寫完整的資料，才能讓其他夥伴們更了解你喔！
              </span>
            )}
          </p>
        </>
      ),
      cancelBtnProps: {
        className: isComplete ? 'hidden' : undefined,
      },
      cancelText: isComplete ? undefined : '暫時不需要',
      confirmText: isComplete ? '開始探索' : '想，填寫資料',
      onConfirm: isComplete
        ? () => {
          router.replace('/personal-card');
        }
        : undefined,
    });
  }, [isComplete, openDialog, router]);
};

export const useCompleteInfoReminder = () => {
  const router = useRouter();
  const { openDialog } = useDialog();

  return useCallback(() => {
    openDialog({
      title: '島主廣播',
      content: (
        <>
          <p className="body-sm mb-6 text-center text-basic-400">
            Hello
            為了讓其他島民能更認識你，要先請你至個人資料頁面完成填寫哦！(,,・ω・,,)
          </p>
          <div className="mx-auto w-max">
            <Image
              src="/assets/images/review-passed.png"
              alt="填寫完能享有更完善的功能"
              width={272}
              height={262}
            />
          </div>
        </>
      ),
      cancelText: '再等等',
      confirmText: '去填寫資料',
      onConfirm: () => {
        router.replace('/personal-card');
      },
    });
  }, [openDialog, router]);
};
