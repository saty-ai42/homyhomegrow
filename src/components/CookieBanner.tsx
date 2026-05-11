import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Cookie, X } from "lucide-react";
import { useT } from "@/stores/i18nStore";


const STORAGE_KEY = "homyhome-cookies-accepted";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const t = useT();

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Cookie size={20} className="text-[#39FF14] shrink-0" />
          <p className="text-sm text-muted-foreground flex-1">
            {t("Wir verwenden Cookies, um dein Erlebnis zu verbessern. Durch die Nutzung stimmst du unserer", "We use cookies to improve your experience. By using our site, you agree to our")}{" "}
            <Link to="/privacy" className="text-[#39FF14] hover:underline">{t("Datenschutzerklärung", "Privacy Policy")}</Link>{" "}
            {t("zu.", ".")}
          </p>
          <div className="flex gap-2 shrink-0">
            <button onClick={accept} className="px-4 py-2 rounded-md text-sm font-bold text-[#0A0A0A] bg-[#39FF14] hover:bg-[#39FF14]/90 transition-colors">
              {t("Akzeptieren", "Accept")}
            </button>
            <button onClick={() => setVisible(false)} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
