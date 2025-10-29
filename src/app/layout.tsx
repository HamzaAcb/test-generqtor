import "./globals.css";

export const metadata = {
  title: "Test Generator",
  description: "Create beautiful printable tests instantly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 text-gray-900 font-sans">
        {/* HEADER */}
        <header className="sticky top-0 z-40 border-b border-green-200 bg-white/80 backdrop-blur-md shadow-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
                📘
              </div>
              <h1 className="text-2xl font-semibold text-green-700 tracking-tight">
                Test Generator
              </h1>
            </div>
            <a
              href="https://vercel.com"
              target="_blank"
              className="text-sm text-gray-600 hover:text-green-600 transition"
            >
              Deployed on Vercel
            </a>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>

        {/* FOOTER */}
        <footer className="mt-10 border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          Created with ❤️ — No login, all local
        </footer>
      </body>
    </html>
  );
}