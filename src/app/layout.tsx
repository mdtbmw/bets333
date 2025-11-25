
import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Inter, Space_Grotesk as SpaceGrotesk, JetBrains_Mono as JetBrainsMono } from 'next/font/google';
import MainLayout from '@/components/layout/main-layout';
import { Web3Provider } from '@/components/web3-provider';
import { Provider as JotaiProvider } from 'jotai';
import { NotificationsProvider } from '@/hooks/use-notifications';
import { ProfileProvider } from '@/hooks/use-profile';
import { HeaderStateProvider } from '@/lib/state/header';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = SpaceGrotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const jetbrainsMono = JetBrainsMono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: 'Intuition BETs — The Signal in the Noise',
  description: 'A premium prediction arena. High stakes, pure signal, verified outcomes.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn("h-[100dvh] overflow-y-auto bg-background font-sans", inter.variable, spaceGrotesk.variable, jetbrainsMono.variable)} suppressHydrationWarning>
        <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.04] bg-noise"></div>

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
            <JotaiProvider>
              <Web3Provider>
                <ProfileProvider>
                  <NotificationsProvider>
                    <HeaderStateProvider>
                      <MainLayout>
                        {children}
                      </MainLayout>
                    </HeaderStateProvider>
                  </NotificationsProvider>
                </ProfileProvider>
              </Web3Provider>
              <Toaster />
            </JotaiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
