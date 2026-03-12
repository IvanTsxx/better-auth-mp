"use client";

import { usePathname, useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LanguageSelector = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLang: string | null | undefined) => {
    if (!newLang) return;
    const pathSegments = pathname.split("/");
    pathSegments[1] = newLang;
    router.push(pathSegments.join("/"));
  };

  const currentLang = pathname.split("/")[1] || "en";

  return (
    <Select value={currentLang} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-fit border-none bg-transparent text-zinc-500 hover:text-zinc-300 focus:ring-0 shadow-none text-sm font-medium px-2 h-auto py-1">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="es">Español</SelectItem>
      </SelectContent>
    </Select>
  );
};
