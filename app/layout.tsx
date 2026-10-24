import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Верстак — облік зарплат меблевих бригад",
  description: "Інструментальний інтерфейс для контролю зарплатні та виробничих записів.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={plexMono.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
