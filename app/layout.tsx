import "./globals.css";

export const metadata = {
  title: "Clean Kitchen",
  description: "Ultimate HACCP management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-black text-white">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}