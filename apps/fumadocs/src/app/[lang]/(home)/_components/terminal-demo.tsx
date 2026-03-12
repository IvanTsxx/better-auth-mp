"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function TerminalDemo() {
  const [copied, setCopied] = useState(false);
  const command = "npx mercadopago-plugin init";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm shadow-2xl overflow-hidden">
      <div className="flex items-center px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
        </div>
        <div className="flex-1 flex justify-center space-x-4 text-xs text-zinc-500 font-medium">
          <span className="text-zinc-300 border-b border-zinc-300 pb-1">
            CLI
          </span>
          <span>Manual</span>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between group">
        <code className="font-mono text-sm text-blue-400">
          <span className="text-pink-500">npx</span> mercadopago-plugin init
        </code>

        <button
          onClick={handleCopy}
          className="p-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Copy command"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}
