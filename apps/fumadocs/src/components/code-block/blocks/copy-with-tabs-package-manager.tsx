"use client";

import { Bun, NPM, PNPM, Yarn, Vercel } from "@react-symbols/icons";
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
import {
  usePackageManager,
  type PackageManager,
} from "@/stores/packageManager";

interface Command {
  name: PackageManager | "skills";
  install: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  dlx: string;
}

interface CodeBlockTabsPkgProps {
  command: string;
  type: "install" | "dlx";
}

const Commands: Command[] = [
  {
    name: "npm",
    install: "npm i",
    icon: NPM,
    dlx: "npx",
  },
  {
    name: "pnpm",
    install: "pnpm i",
    icon: PNPM,
    dlx: "pnpm dlx",
  },
  {
    name: "yarn",
    install: "yarn add",
    icon: Yarn,
    dlx: "yarn dlx",
  },
  {
    name: "bun",
    install: "bun add",
    icon: Bun,
    dlx: "bunx --bun",
  },
  {
    name: "skills",
    install:
      "npx skills add https://github.com/ivantsxx/my-next-skills --skill architect-nextjs",
    icon: Vercel,
    dlx: "bunx --bun",
  },
];

const CodeBlockTabsPkg = ({ command, type }: CodeBlockTabsPkgProps) => {
  const { packageManager, setPackageManager } = usePackageManager();

  const selectedPkg =
    Commands.find((pkg) => pkg.name === packageManager) ?? Commands[0];
  const fullCommand = `${selectedPkg[type]} ${command}`;

  return (
    <Tabs
      className="w-full gap-1 bg-background dark:bg-background"
      value={packageManager}
      onValueChange={(value) => setPackageManager(value as PackageManager)}
    >
      <CodeBlock className="gap-2 bg-background dark:bg-background">
        <CodeBlockHeader className="bg-background dark:bg-background">
          <div className="flex items-center space-x-1">
            <CodeBlockIcon language="bash" />
            <TabsList className="bg-background dark:bg-background space-x-1">
              {Commands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <TabsTrigger
                    key={cmd.name}
                    value={cmd.name}
                    className="data-[state=active]:shadow-none border bg-background dark:bg-background border-zinc-800 "
                  >
                    <Icon className="size-4" />
                    <span>{cmd.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          <CopyButton className="pl-1" content={fullCommand} />
        </CodeBlockHeader>
        <CodeBlockContent className="bg-background dark:bg-background">
          {Commands.map((cmd) => (
            <TabsContent
              key={cmd.name}
              value={cmd.name}
              className="mt-0 bg-background dark:bg-background"
            >
              <CodeblockShiki
                language="bash"
                lineNumbers={true}
                code={`${cmd[type]} ${command}`}
                className="bg-background dark:bg-background"
              />
            </TabsContent>
          ))}
        </CodeBlockContent>
      </CodeBlock>
    </Tabs>
  );
};

export { CodeBlockTabsPkg };
