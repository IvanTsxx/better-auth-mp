export const SectionContainer = ({
  lang,
  children,
  title,
}: {
  lang: string;
  children: React.ReactNode;
  title: string;
}) => {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          {title}
        </h2>
        <div className="h-px bg-zinc-800/50 flex-1" />
      </div>
      {children}
    </section>
  );
};
