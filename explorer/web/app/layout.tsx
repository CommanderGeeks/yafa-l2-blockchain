import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-green-400">
          {children}
        </div>
      </body>
    </html>
  );
}