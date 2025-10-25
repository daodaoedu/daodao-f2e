import { Button } from '@/shared/ui/button';
import { UserXIcon } from 'lucide-react';
import { CustomLink } from '@/shared/ui/custom-link';
import { Background, Container, Paper } from '@/shared/ui/wrapper';

export default function NotFound() {
  return (
    <Background className="min-h-screen">
      <Container>
        <Paper>
          <div className="mb-6 flex justify-center">
            <UserXIcon className="size-24 text-muted-foreground" />
          </div>

          <h1 className="mb-4 text-center text-2xl font-bold text-foreground">
            找不到此使用者
          </h1>

          <p className="mb-8 text-center text-muted-foreground">
            抱歉，您要查看的使用者個人檔案不存在或已被移除。
            <br />
            請確認網址是否正確。
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <CustomLink href="/" className="flex items-center gap-2">
                回到首頁
              </CustomLink>
            </Button>
          </div>
        </Paper>
      </Container>
    </Background>
  );
}
