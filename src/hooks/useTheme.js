import { ThemeProviderContextInstance } from "@/components/theme-provider";
import { useContext } from "react";

export function useTheme() {
  const context = useContext(ThemeProviderContextInstance);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
