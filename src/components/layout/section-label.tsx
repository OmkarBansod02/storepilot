interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
      <span className="h-4 w-0.5 rounded-full bg-primary/40" />
      {children}
    </h2>
  );
}
