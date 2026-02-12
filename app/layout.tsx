import "../styles/globals.css";
import { AuthProvider } from '@/lib/auth-context';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

export const metadata = {
  title: "WriFe - Writer's Journey",
  description: "Interactive grammar practice and progressive writing for primary school pupils",
  manifest: '/manifest.json',
  themeColor: '#27AE60',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "WriFe",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ServiceWorkerRegistration />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
