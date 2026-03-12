import { createFromSource } from "fumadocs-core/search/server";

import { source } from "@/lib/source";

export const { GET } = createFromSource(source, {
  localeMap: {
    es: { language: "spanish" },
    en: { language: "english" },
  },
});
