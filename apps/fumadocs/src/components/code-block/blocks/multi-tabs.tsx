import { CodeblockShiki } from "@/components/code-block/client/shiki";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockIcon,
} from "@/components/code-block/code-block";
import { CopyButton } from "@/components/code-block/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Languages } from "@/utils/shiki/highlight";

const Code = [
  {
    code: `import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
    lang: "tsx",
    title: "layout.tsx",
  },
  {
    code: `export default function Home() {
  return (
    <div>
      <p>Home page</p>
    </div>
  );
}`,
    lang: "tsx",
    title: "page.tsx",
  },
  {
    code: `@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}`,
    lang: "css",
    title: "globals.css",
  },
];

const CopyWithTabsCode = () => (
  <Tabs className="w-full gap-1">
    <CodeBlock>
      <CodeBlockHeader>
        <div className="flex items-center space-x-1">
          <TabsList className="gap-1 border-0 bg-transparent dark:bg-transparent">
            {Code.map((c) => (
              <TabsTrigger
                value={c.title}
                key={c.title}
                className="data-[state=active]:bg-transparent"
              >
                <CodeBlockIcon language={c.lang} />
                <span>{c.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </CodeBlockHeader>
      <CodeBlockContent className="relative">
        {Code.map((cmd) => (
          <TabsContent key={cmd.title} value={cmd.title}>
            <div className="relative">
              <CopyButton
                content={cmd.code}
                className="sticky top-2.5 right-2.5 z-10 float-right -mb-10 p-1"
              />
              <CodeblockShiki
                code={cmd.code}
                language={cmd.lang as Languages}
              />
            </div>
          </TabsContent>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  </Tabs>
);

export default CopyWithTabsCode;
