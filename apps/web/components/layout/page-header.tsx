import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className="space-y-2">
      {eyebrow && (
        <p className="text-xs font-semibold tracking-[0.18em] text-brand-pastel-pink uppercase">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children}
    </header>
  );
}
