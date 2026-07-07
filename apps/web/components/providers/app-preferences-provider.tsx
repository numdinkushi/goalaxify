"use client";

import { LanguageProvider } from "@/components/providers/language-provider";

export function AppPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
