import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Bakery Management System",
  description: "প্রতিদিন কী বানালেন, কত খরচ হলো, কাকে কত বিক্রি করলেন — সব এক জায়গায়",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  viewport: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bakery POS",
  },
};

export const viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <head>
        <link
          href="https://fonts.maateen.me/kalpurush/font.css"
          rel="stylesheet"
        />
        <style>{`
          body {
            font-family: 'Kalpurush', 'Arial', sans-serif !important;
          }
        `}</style>
      </head>
      <body
        className={`font-kalpurush antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
