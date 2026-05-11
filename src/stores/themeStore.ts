import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "homyhomegrow-theme";

function getStoredTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

// Apply theme immediately on module load — independent of main.tsx
const initialTheme = getStoredTheme();
applyThemeToDOM(initialTheme);

export const useTheme = create<ThemeState>((set) => ({
  theme: initialTheme,

  // FIX: DOM update OUTSIDE the set updater — avoids Strict Mode double-call
  toggleTheme: () => {
    const current = useTheme.getState().theme;
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyThemeToDOM(next);
    set({ theme: next });
  },

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyThemeToDOM(theme);
    set({ theme });
  },
}));
