import { HomeLayout } from "fumadocs-ui/layouts/home";
import { GeistPixelSquare } from "geist/font/pixel";
import type { ReactNode } from "react";

import { baseOptions } from "@/lib/layout.shared";

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
      className={`${GeistPixelSquare.className} antialiased grid transition-[grid-template-columns] overflow-x-clip min-h-(--fd-docs-height) [--fd-docs-height:100dvh] [--fd-header-height:0px] [--fd-toc-popover-height:0px] [--fd-sidebar-width:0px] [--fd-toc-width:0px]`}
    >
      {children}
    </HomeLayout>
  );
}
