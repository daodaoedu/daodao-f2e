'use client';

import { ThemeProvider } from 'next-themes';

function Providers({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider attribute="class">
      {children}
    </ThemeProvider>
  );
}

export default Providers;