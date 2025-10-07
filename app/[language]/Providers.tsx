'use client';

import { SWRConfig } from 'swr';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/Auth';
import { DialogProvider } from '@/contexts/Dialog';
import { PromotionProvider } from '@/contexts/Promotion';
import { Toaster } from '@/components/ui/sonner';

const swrConfig = {
  revalidateOnFocus: false,
  errorRetryCount: 0,
  keepPreviousData: true,
};

function Providers({ children }: React.PropsWithChildren) {
  return (
    <SWRConfig value={swrConfig}>
      <DialogProvider>
        <AuthProvider>
          <PromotionProvider>
            <ThemeProvider attribute="class" themes={['light', 'dark']} defaultTheme="light" forcedTheme="light">
              {children}
              <Toaster />
            </ThemeProvider>
          </PromotionProvider>
        </AuthProvider>
      </DialogProvider>
    </SWRConfig>
  );
}

export default Providers;
