import { Link } from "react-router";
import { motion } from "framer-motion";
import { Shield, Lock, ArrowLeft, Home } from "lucide-react";
import { useT } from "@/stores/i18nStore";

export default function AdminGuard() {
  const t = useT();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center"
      >
        {/* Lock Icon */}
        <div className="relative mx-auto mb-6">
          <div className="w-20 h-20 rounded-full bg-[#FF4444]/10 flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-[#FF4444]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#FFD600]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground font-heading mb-2">
          {t("Admin-Bereich", "Admin Area")}
        </h1>

        {/* Message */}
        <p className="text-muted-foreground mb-2">
          {t(
            "Du hast keine Berechtigung für diesen Bereich.",
            "You don't have permission to access this area."
          )}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {t(
            "Nur der Seitenbetreiber (Andreas Meyer) hat Zugriff auf den Admin-Bereich. Wenn du glaubst, dass dies ein Fehler ist, kontaktiere uns.",
            "Only the site owner (Andreas Meyer) has access to the admin area. If you believe this is an error, please contact us."
          )}
        </p>

        {/* Info Box */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 text-left">
          <p className="text-xs text-muted-foreground mb-1">
            <strong className="text-foreground">{t("Angemeldet als:", "Logged in as:")}</strong>
          </p>
          <p className="text-sm text-foreground font-mono">
            {t("Standard-User (kein Admin)", "Standard User (not admin)")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-[#0A0A0A] bg-[#39FF14] hover:bg-[#39FF14]/90 transition-colors"
          >
            <Home size={18} />
            {t("Zur Startseite", "Back to Home")}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={16} />
            {t("Zurück", "Go Back")}
          </button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-muted-foreground">
          {t("Solltest du Admin-Zugang benötigen, wende dich an", "If you need admin access, contact")}{" "}
          <a href="mailto:info@homyhomegrow.com" className="text-[#39FF14] hover:underline">
            info@homyhomegrow.com
          </a>
        </p>
      </motion.div>
    </div>
  );
}
