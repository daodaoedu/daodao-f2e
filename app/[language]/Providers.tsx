'use client';

import { SWRConfig } from 'swr';
import { ThemeProvider } from 'next-themes';
import { LoginModal } from '@/features/auth';
import { SessionProvider } from '@/entities/session';
import { DialogProvider } from '@/contexts/Dialog';
import { PromotionProvider } from '@/contexts/Promotion';
import { NavigationBlockerProvider } from '@/shared/lib/navigation-blocker';
import { emitUnauthorized } from '@/shared/lib/auth-bus';
import { ApiError } from '@/services/fetcher';
import { TranslationProvider } from '@/shared/lib/translation';
import { Toaster } from '@/shared/ui/sonner';
import { getDictionary } from '@/shared/config/i18n';

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
  locale: string;
}

function Providers({ children, locale }: ProvidersProps) {
  const dictionary = getDictionary(locale);

  return (
    <TranslationProvider dictionary={dictionary}>
      <SWRConfig value={swrConfig}>
        <NavigationBlockerProvider>
          <DialogProvider>
            <SessionProvider>
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
            </SessionProvider>
          </DialogProvider>
        </NavigationBlockerProvider>
      </SWRConfig>
    </TranslationProvider>
  );
}

export default Providers;
