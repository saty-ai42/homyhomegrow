import { useState, useEffect } from "react";
import { ShieldAlert, Check, X } from "lucide-react";
import { useT } from "@/stores/i18nStore";


const STORAGE_KEY = "homyhome-age-verified";
const EXPIRY_DAYS = 30;

export default function AgeVerificationGate() {
  const [isVisible, setIsVisible] = useState(false);
  const t = useT();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const expiry = new Date(data.expiry);
        if (expiry > new Date()) return;
      } catch { /* invalid */ }
    }
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const verify = () => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + EXPIRY_DAYS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ expiry: expiry.toISOString() }));
    setIsVisible(false);
  };

  const leave = () => {
    window.location.href = "https://www.google.com";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-card border border-border rounded-xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-[#39FF14]/10 mb-4">
            <ShieldAlert className="w-8 h-8 text-[#39FF14]" />
          </div>
          <h2 className="text-2xl font-bold text-foreground font-heading uppercase tracking-tight">
            {t("Altersverifikation", "Age Verification")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {t(
              "Diese Website enthält Informationen über Cannabis-Anbau. Du musst mindestens 18 Jahre alt sein, um fortzufahren.",
              "This website contains information about cannabis cultivation. You must be at least 18 years old to proceed."
            )}
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-[#FFD600]/10 border border-[#FFD600]/20">
            <span className="text-sm font-mono font-bold text-[#FFD600]">18+</span>
          </div>
          <div className="flex gap-3 mt-6 w-full">
            <button
              onClick={leave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-[#FF4444] transition-colors"
            >
              <X size={16} />
              {t("Verlassen", "Leave")}
            </button>
            <button
              onClick={verify}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold text-[#0A0A0A] bg-[#39FF14] hover:bg-[#39FF14]/90 transition-colors"
            >
              <Check size={16} />
              {t("Ich bin 18+", "I am 18+")}
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t(
              "Durch Klicken auf \"Ich bin 18+\" bestätigst du, dass du volljährig bist und die geltenden Gesetze in deinem Land kennst.",
              "By clicking \"I am 18+\" you confirm that you are of legal age and know the applicable laws in your country."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
