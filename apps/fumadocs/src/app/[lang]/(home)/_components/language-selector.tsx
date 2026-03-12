"use client";

import { usePathname, useRouter } from "next/navigation";

export const LanguageSelector = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    const pathSegments = pathname.split("/");
    pathSegments[1] = newLang;
    router.push(pathSegments.join("/"));
  };

  return (
    <select
      onChange={handleLanguageChange}
      className="bg-transparent text-zinc-500 text-sm font-medium border-none focus:outline-none"
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
};
