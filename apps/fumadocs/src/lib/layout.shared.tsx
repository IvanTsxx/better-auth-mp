import { defineI18nUI } from "fumadocs-ui/i18n";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { i18n } from "./i18n";

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  branch: "main",
  repo: "better-auth-mercadopago",
  user: "IvanTsxx",
};

export const i18nUI = defineI18nUI(i18n, {
  translations: {
    en: {
      displayName: "English",
    },
    es: {
      displayName: "Spanish",
    },
  },
});

export function baseOptions(lang?: string): BaseLayoutProps {
  return {
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    i18n,
    nav: {
      title: "Better Auth Mercado Pago Plugin",
    },
  };
}
