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

interface Code {
  title: string;
  lang: string;
  code: string;
}

export const CodeExamples = ({ code }: { code: Code[] }) => (
  <Tabs className="w-full gap-1 ">
    <CodeBlock className="bg-background dark:bg-background">
      <CodeBlockHeader>
        <div className="flex items-center space-x-1">
          <TabsList className="gap-1 border-0 bg-background dark:bg-background">
            {code.map((c) => (
              <TabsTrigger
                value={c.title}
                key={c.title}
                className="data-[state=active]:bg-background"
              >
                <CodeBlockIcon language={c.lang} />
                <span>{c.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </CodeBlockHeader>
      <CodeBlockContent className="relative bg-background dark:bg-background">
        {code.map((cmd) => (
          <TabsContent key={cmd.title} value={cmd.title}>
            <div className="relative">
              <CopyButton
                content={cmd.code}
                className="sticky top-2.5 right-2.5 z-10 float-right -mb-10 p-1"
              />
              <CodeblockShiki
                lineNumbers={true}
                className="bg-background dark:bg-background"
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
