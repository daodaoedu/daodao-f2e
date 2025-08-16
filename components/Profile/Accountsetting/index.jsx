import { Title, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import { useAuth, useAuthDispatch } from '@/contexts/Auth';

const AccountSetting = () => {
  const router = useRouter();
  const authDispatch = useAuthDispatch();
  const { user } = useAuth();

  const logout = () => {
    authDispatch.logout();
    router.push('/');
  };

  return (
    <div className="bg-white w-full max-w-[672px] rounded-2xl p-4 md:p-9 flex flex-col justify-center items-center">
      <Title className="text-[22px] text-[#536166]">
        帳號設定
      </Title>
      <div className="flex flex-col items-start w-full max-w-[544px]">
        <div className="flex flex-col w-full">
          <Text className="font-medium text-base leading-[1.4] text-[#293a3d]">
            電子信箱
          </Text>
          <div className="w-full my-2 mb-8 rounded-lg border border-[#DBDBDB] bg-[#F3F3F3] p-3 text-[#92989A] break-all">
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
        <Separator className="w-full text-black my-8 h-0.5" />
        <div className="flex flex-col w-full">
          <Text className="mb-6 font-medium text-base leading-[1.4] text-[#293a3d]">
            登出帳號
          </Text>
          <Button
            onClick={logout}
            className="rounded-[20px] bg-white text-[#1f4645] py-1.5 px-0 w-full shadow-[0px_4px_10px_0px_rgba(196,194,193,0.4)] hover:bg-white"
          >
            登出
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountSetting;
