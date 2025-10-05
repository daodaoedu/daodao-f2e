'use client';

import { SWRConfig } from 'swr';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/Auth';
import { DialogProvider } from '@/contexts/Dialog';
import { PromotionProvider } from '@/contexts/Promotion';
import { NavigationBlockerProvider } from '@/shared/lib/navigation-blocker';
import { Toaster } from '@/shared/ui/sonner';

const swrConfig = {
  revalidateOnFocus: false,
  errorRetryCount: 0,
  keepPreviousData: true,
};

function Providers({ children }: React.PropsWithChildren) {
  return (
    <SWRConfig value={swrConfig}>
      <NavigationBlockerProvider>
        <DialogProvider>
          <AuthProvider>
            <PromotionProvider>
              <ThemeProvider attribute="class" themes={['light']}>
                {children}
                <Toaster />
              </ThemeProvider>
            </PromotionProvider>
          </AuthProvider>
        </DialogProvider>
      </NavigationBlockerProvider>
    </SWRConfig>
  );
}

export default Providers;
