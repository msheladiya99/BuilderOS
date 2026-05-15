import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface ThemeContextValue {
  isDark: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem("builderos_dark") === "true");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("builderos_dark", String(isDark));
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark: () => setIsDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
