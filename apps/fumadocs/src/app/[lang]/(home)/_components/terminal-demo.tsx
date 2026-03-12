"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function TerminalDemo() {
  const [copied, setCopied] = useState(false);
  const command = "npx auth init";
  const [activeTab, setActiveTab] = useState("CLI");

  const tabs = ["CLI", "Prompt", "MCP", "Skills"];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-zinc-800/60 bg-[#09090b] rounded-md overflow-hidden font-mono text-sm max-w-4xl shadow-2xl">
      <div className="flex items-center gap-8 px-5 pt-3 border-b border-zinc-800/60 bg-[#0a0a0a]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[12px] pb-[10px] border-b-2 transition-colors -mb-px px-1 tracking-wide ${
              activeTab === tab
                ? "border-zinc-300 text-zinc-300"
                : "border-transparent text-zinc-600 hover:text-zinc-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-5 flex items-center justify-between group bg-[#09090b]">
        <code className="text-zinc-300 text-[13px] tracking-wide">
          <span className="text-[#c678dd]">npx</span> mp-plugin init
        </code>

        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Copy command"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}
