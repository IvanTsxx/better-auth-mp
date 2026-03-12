import { source } from "@/lib/source";

export function GET() {
  const lines: string[] = [
    "# Documentation",
    "",
    ...source
      .getPages()
      .map(
        (page) => `-[${page.data.title}](${page.url}): ${page.data.description}`
      ),
  ];
  return new Response(lines.join("\n"));
}
