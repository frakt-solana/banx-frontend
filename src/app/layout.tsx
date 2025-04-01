export const metadata = {
  title: "Banx Frontend",
  description: "Next.js rewrite of Banx UI",
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
