import "../styles/globals.css";

export const metadata = {
  title: "WriFe - Writing for Everyone",
  description: "WriFe - Learn, practice, and master writing skills",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
