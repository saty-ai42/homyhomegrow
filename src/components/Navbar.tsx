import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Sun, Moon, LogIn, LogOut, Shield, Wrench } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/stores/themeStore";
import { useI18n, useT } from "@/stores/i18nStore";


const navLinks = [
  { path: "/", labelDe: "Home", labelEn: "Home" },
  { path: "/blog", labelDe: "Blog", labelEn: "Blog" },
  { path: "/guides", labelDe: "Guides", labelEn: "Guides" },
  { path: "/diary", labelDe: "Diary", labelEn: "Diary" },
  { path: "/gallery", labelDe: "Gallery", labelEn: "Gallery" },
  { path: "/tools", labelDe: "Tools", labelEn: "Tools" },
  { path: "/about", labelDe: "About", labelEn: "About" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const theme = useTheme();
  const locale = useI18n((s) => s.locale);
  const setLocale = useI18n((s) => s.setLocale);
  const t = useT();
  const location = useLocation();

  const isAdmin = user?.role === "admin";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-0 shrink-0">
            <span className="text-xl font-bold text-foreground font-heading tracking-[-0.02em]">HOMYHOME</span>
            <span className="text-xl font-bold text-[#39FF14] font-heading tracking-[-0.02em]">GROW</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#39FF14] bg-[#39FF14]/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  }`}
                >
                  {locale === "en" ? link.labelEn : link.labelDe}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* DE | EN Pill Toggle */}
            <button
              onClick={() => setLocale(locale === "de" ? "en" : "de")}
              className="flex items-center gap-0 px-1 py-0.5 rounded-md border border-border bg-card text-[10px] font-mono font-bold uppercase hover:border-[#39FF14]/30 transition-colors"
              title={locale === "de" ? "Switch to English" : "Auf Deutsch wechseln"}
            >
              <span className={`px-1 py-0.5 rounded-sm transition-colors ${locale === "de" ? "text-[#39FF14]" : "text-muted-foreground"}`}>
                DE
              </span>
              <span className="text-border text-[8px]">|</span>
              <span className={`px-1 py-0.5 rounded-sm transition-colors ${locale === "en" ? "text-[#39FF14]" : "text-muted-foreground"}`}>
                EN
              </span>
            </button>

            <button
              onClick={() => theme.toggleTheme()}
              className="p-2 rounded-md text-muted-foreground hover:text-[#39FF14] hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAdmin && (
              <Link
                to="/admin"
                className="p-2 rounded-md text-[#FFD600] hover:bg-secondary transition-colors"
                title="Admin"
              >
                <Shield size={18} />
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground truncate max-w-[100px]">{user?.name}</span>
                <button
                  onClick={logout}
                  className="p-2 rounded-md text-muted-foreground hover:text-[#FF4444] hover:bg-secondary transition-colors"
                  title={t("Abmelden", "Logout")}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-[#0A0A0A] bg-[#39FF14] hover:bg-[#39FF14]/90 transition-colors"
              >
                <LogIn size={16} />
                {t("Anmelden", "Login")}
              </Link>
            )}
          </div>

          {/* Mobile: Always-visible toggles + hamburger */}
          <div className="md:hidden flex items-center gap-0.5">
            {/* DE | EN Pill Toggle */}
            <button
              onClick={() => setLocale(locale === "de" ? "en" : "de")}
              className="flex items-center gap-0 px-1 py-0.5 rounded-md border border-border bg-card text-[10px] font-mono font-bold uppercase hover:border-[#39FF14]/30 transition-colors"
              title={locale === "de" ? "Switch to English" : "Auf Deutsch wechseln"}
            >
              <span className={`px-1 py-0.5 rounded-sm transition-colors ${locale === "de" ? "text-[#39FF14]" : "text-muted-foreground"}`}>
                DE
              </span>
              <span className="text-border text-[8px]">|</span>
              <span className={`px-1 py-0.5 rounded-sm transition-colors ${locale === "en" ? "text-[#39FF14]" : "text-muted-foreground"}`}>
                EN
              </span>
            </button>
            <button
              onClick={() => theme.toggleTheme()}
              className="p-2 rounded-md text-muted-foreground hover:text-[#39FF14] hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
              title={theme.theme === "dark" ? t("Hellmodus", "Light mode") : t("Dunkelmodus", "Dark mode")}
            >
              {theme.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4">
          <nav className="flex flex-col gap-1 mt-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#39FF14] bg-[#39FF14]/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {locale === "en" ? link.labelEn : link.labelDe}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <button
              onClick={() => setLocale(locale === "de" ? "en" : "de")}
              className="px-2 py-1 rounded text-xs font-mono text-muted-foreground hover:text-[#39FF14] hover:bg-secondary transition-colors uppercase"
            >
              {locale}
            </button>
            <button
              onClick={() => theme.toggleTheme()}
              className="p-2 rounded-md text-muted-foreground hover:text-[#39FF14] hover:bg-secondary transition-colors"
            >
              {theme.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-md text-[#FFD600] hover:bg-secondary transition-colors"
              >
                <Shield size={18} />
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-[#FF4444] hover:bg-secondary transition-colors"
              >
                <LogOut size={16} />
                {t("Abmelden", "Logout")}
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-[#0A0A0A] bg-[#39FF14] hover:bg-[#39FF14]/90 transition-colors"
              >
                <LogIn size={16} />
                {t("Anmelden", "Login")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
