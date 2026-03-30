"use client";

import { Bun, NPM, PNPM, Yarn } from "@react-symbols/icons";
import type { FC, SVGProps } from "react";

import { CodeblockShiki } from "@/components/code-block/client/shiki";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockIcon,
} from "@/components/code-block/code-block";
import { CopyButton } from "@/components/code-block/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SkillsCommand {
  name: string;
  command: string;
  icon: FC<SVGProps<SVGSVGElement>>;
}

const SKILLS_COMMANDS: SkillsCommand[] = [
  {
    command: "npx skills add IvanTsxx/better-auth-mp",
    icon: NPM,
    name: "npx",
  },
  {
    command: "bunx --bun skills add IvanTsxx/better-auth-mp",
    icon: Bun,
    name: "bunx",
  },
  {
    command: "pnpm dlx skills add IvanTsxx/better-auth-mp",
    icon: PNPM,
    name: "pnpm",
  },
  {
    command: "yarn dlx skills add IvanTsxx/better-auth-mp",
    icon: Yarn,
    name: "yarn",
  },
];

const CodeBlockSkills = () => {
  const [defaultTab] = SKILLS_COMMANDS;

  return (
    <Tabs
      className="w-full gap-1 bg-background dark:bg-background"
      defaultValue={defaultTab.name}
    >
      <CodeBlock className="gap-2 bg-background dark:bg-background">
        <CodeBlockHeader className="bg-background dark:bg-background">
          <div className="flex items-center space-x-1">
            <CodeBlockIcon language="bash" />
            <TabsList className="bg-background dark:bg-background space-x-1">
              {SKILLS_COMMANDS.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <TabsTrigger
                    key={cmd.name}
                    value={cmd.name}
                    className="data-[state=active]:shadow-none border bg-background dark:bg-background border-zinc-800"
                  >
                    <Icon className="size-4" />
                    <span>{cmd.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          <CopyButton className="pl-1" content={`${defaultTab.command}`} />
        </CodeBlockHeader>
        <CodeBlockContent className="bg-background dark:bg-background">
          {SKILLS_COMMANDS.map((cmd) => (
            <TabsContent
              key={cmd.name}
              value={cmd.name}
              className="mt-0 bg-background dark:bg-background"
            >
              <CodeblockShiki
                language="bash"
                lineNumbers={true}
                code={cmd.command}
                className="bg-background dark:bg-background"
              />
            </TabsContent>
          ))}
        </CodeBlockContent>
      </CodeBlock>
    </Tabs>
  );
};

export { CodeBlockSkills };
