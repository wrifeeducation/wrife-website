import "../styles/globals.css";
import { AuthProvider } from '@/lib/auth-context';

export const metadata = {
  title: "WriFe - Writing for Everyone",
  description: "WriFe - Learn, practice, and master writing skills",
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
