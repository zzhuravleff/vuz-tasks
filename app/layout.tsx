import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Menu from "@/components/menu";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ВУЗадачи - Отслеживайте свои учебные задачи эффективно",
  description: "Приложение для управления учебными задачами, интегрированное с твоим расписанием. Создавайте задачи на основе расписания и кастомные задачи, устанавливайте сроки и получайте уведомления.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="кг"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex flex-col items-center min-h-full bg-[#f5f5f5]">
        <Analytics />
        <ServiceWorkerRegistrar />
        <main className="w-full p-4 mb-24">{children}</main>
        <Menu />
        <SpeedInsights />
      </body>
    </html>
  );
}
