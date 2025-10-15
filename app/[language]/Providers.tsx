'use client';

import { SWRConfig } from 'swr';
import { ThemeProvider } from 'next-themes';
import { SessionProvider, LoginModal } from '@/features/auth';
import { DialogProvider } from '@/contexts/Dialog';
import { PromotionProvider } from '@/contexts/Promotion';
import { NavigationBlockerProvider } from '@/shared/lib/navigation-blocker';
import { emitUnauthorized } from '@/shared/lib/auth-bus';
import { ApiError } from '@/services/fetcher';
import {
  TranslationProvider,
  TranslationProviderProps,
} from '@/shared/lib/translation';
import { Toaster } from '@/shared/ui/sonner';

const swrConfig = {
  revalidateOnFocus: false,
  errorRetryCount: 0,
  keepPreviousData: true,
  onError: (e: unknown) => {
    if (e instanceof ApiError && e.status === 401) {
      emitUnauthorized();
    }
  },
};

type ProvidersProps = TranslationProviderProps;

function Providers({ children, dictionary }: ProvidersProps) {
  return (
    <TranslationProvider dictionary={dictionary}>
      <SWRConfig value={swrConfig}>
        <NavigationBlockerProvider>
          <DialogProvider>
            <SessionProvider>
              <PromotionProvider>
                <ThemeProvider attribute="class">
                  {children}
                  <Toaster />
                  <LoginModal />
                </ThemeProvider>
              </PromotionProvider>
            </SessionProvider>
          </DialogProvider>
        </NavigationBlockerProvider>
      </SWRConfig>
    </TranslationProvider>
  );
}

export default Providers;
