'use client';

import { SWRConfig } from 'swr';
import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider, LoginModal } from '@/entities/user';
import { DialogProvider } from '@/contexts/Dialog';
import { PromotionProvider } from '@/contexts/Promotion';
import { NavigationBlockerProvider } from '@/shared/lib/navigation-blocker';
import { emitUnauthorized } from '@/shared/lib/auth-bus';
import { ApiError } from '@/shared/api';
import { TranslationProvider } from '@/shared/lib/translation';
import { Toaster } from '@/shared/ui/sonner';
import type { Dictionary } from '@/shared/config/i18n';

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

interface ProvidersProps {
  children: React.ReactNode;
  dictionary: Dictionary;
  locale: string;
}

function Providers({ children, dictionary, locale }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale}>
      <TranslationProvider dictionary={dictionary}>
        <SWRConfig value={swrConfig}>
          <NavigationBlockerProvider>
            <DialogProvider>
              <AuthProvider>
                <PromotionProvider>
                  <ThemeProvider attribute="class">
                    {children}
                    <Toaster
                      position="top-center"
                      expand
                      toastOptions={{
                        style: {
                          marginTop: '80px', // 避免被 header 遮擋
                        },
                      }}
                    />
                    <LoginModal />
                  </ThemeProvider>
                </PromotionProvider>
              </AuthProvider>
            </DialogProvider>
          </NavigationBlockerProvider>
        </SWRConfig>
      </TranslationProvider>
    </NextIntlClientProvider>
  );
}

export default Providers;
