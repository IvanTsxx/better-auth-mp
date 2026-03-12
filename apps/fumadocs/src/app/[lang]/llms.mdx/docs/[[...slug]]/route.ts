import { notFound } from "next/navigation";

import { getLLMText } from "@/lib/get-llm-text";
import { source } from "@/lib/source";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lang: string; slug?: string[] }> }
) {
  const { slug, lang } = await params;

  const slugContainsLocale = slug?.includes(lang);

  let normalizedSlug = slugContainsLocale ? slug?.slice(1) : slug;

  if (
    normalizedSlug &&
    normalizedSlug.length === 1 &&
    normalizedSlug[0] === "index"
  ) {
    normalizedSlug = [];
  }

  const page = source.getPage(normalizedSlug, lang);

  if (!page) {
    notFound();
  }

  return new Response(await getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}
