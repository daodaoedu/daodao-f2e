'use client';

import { SWRConfig } from 'swr';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/Auth';
import { DialogProvider } from '@/contexts/Dialog';
import { PromotionProvider } from '@/contexts/Promotion';
import { NavigationBlockerProvider } from '@/shared/lib/navigation-blocker';
import {
  TranslationProvider,
  TranslationProviderProps,
} from '@/shared/lib/translation';
import { Toaster } from '@/shared/ui/sonner';

const swrConfig = {
  revalidateOnFocus: false,
  errorRetryCount: 0,
  keepPreviousData: true,
};

type ProvidersProps = TranslationProviderProps;

function Providers({ children, dictionary }: ProvidersProps) {
  return (
    <TranslationProvider dictionary={dictionary}>
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
    </TranslationProvider>
  );
}

export default Providers;
