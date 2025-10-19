import { Title, Text } from '@/shared/ui/typography';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { useRouter } from 'next/navigation';
import { useSession, useSessionActions } from '@/entities/session';

const AccountSetting = () => {
  const router = useRouter();
  const authDispatch = useSessionActions();
  const { user } = useSession();

  const logout = () => {
    authDispatch.logout();
    router.push('/');
  };

  return (
    <div className="flex w-full max-w-[672px] flex-col items-center justify-center rounded-2xl bg-white p-4 md:p-9">
      <Title className="text-[22px] text-[#536166]">
        帳號設定
      </Title>
      <div className="flex w-full max-w-[544px] flex-col items-start">
        <div className="flex w-full flex-col">
          <Text className="text-base font-medium leading-[1.4] text-[#293a3d]">
            電子信箱
          </Text>
          <div className="my-2 mb-8 w-full break-all rounded-lg border border-[#DBDBDB] bg-[#F3F3F3] p-3 text-[#92989A]">
            {user?.email}
          </div>
        </div>
        {/* <div className="flex flex-col">
          <Text className="font-medium text-base leading-[1.4] text-[#293a3d]">電話驗證</Text>
          <Button
            variant="contained"
            size="small"
            className="w-full my-2 mb-8 bg-white"
          >
            進行驗證
          </Button>
        </div> */}
        <Separator className="my-8 h-0.5 w-full text-black" />
        <div className="flex w-full flex-col">
          <Text className="mb-6 text-base font-medium leading-[1.4] text-[#293a3d]">
            登出帳號
          </Text>
          <Button
            onClick={logout}
            className="w-full rounded-[20px] bg-white px-0 py-1.5 text-[#1f4645] shadow-[0px_4px_10px_0px_rgba(196,194,193,0.4)] hover:bg-white"
          >
            登出
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountSetting;
