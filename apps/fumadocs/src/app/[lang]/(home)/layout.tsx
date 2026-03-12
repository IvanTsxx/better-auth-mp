import { HomeLayout } from "fumadocs-ui/layouts/home";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

import { baseOptions } from "@/lib/layout.shared";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["400", "500", "600", "700"],
});

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;

  return (
    <HomeLayout
      {...baseOptions(lang)}
      nav={{
        enabled: false,
      }}
      className={`${geist.className} antialiased`}
    >
      {children}
    </HomeLayout>
  );
}
