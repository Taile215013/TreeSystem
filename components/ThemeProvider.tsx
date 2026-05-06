"use client";

import {
  createContext,
  useContext,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

type Theme = "dark" | "light";
const STORAGE_KEY = "treesystem-theme";
const DEFAULT_THEME: Theme = "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  toggleTheme: () => {},
  isDark: true,
});

export function useTheme() {
  return useContext(ThemeContext);
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const raw = localStorage.getItem(STORAGE_KEY) as Theme | null;
  return raw === "light" || raw === "dark" ? raw : DEFAULT_THEME;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useLayoutEffect(() => {
    const initial = readStoredTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      isDark: theme === "dark",
    }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
