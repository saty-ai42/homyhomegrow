import { motion } from "framer-motion";
import { Settings, Info } from "lucide-react";
import { useT } from "@/stores/i18nStore";


export default function AdminSettings() {
  const t = useT();
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8"><Settings className="w-7 h-7 text-[#39FF14]" /><h1 className="text-3xl font-bold text-foreground font-heading">Settings</h1></div>
          <div className="bg-card border border-border rounded-xl p-8 text-center max-w-lg mx-auto">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground font-heading mb-2">{t("Einstellungen", "Settings")}</h2>
            <p className="text-muted-foreground">{t("Dieser Bereich ist für zukünftige System-Einstellungen reserviert.", "This area is reserved for future system settings.")}</p>
            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-center justify-between py-2 border-b border-border"><span className="text-foreground">App Name</span><span className="text-muted-foreground font-mono">HomyHomegrow</span></div>
              <div className="flex items-center justify-between py-2 border-b border-border"><span className="text-foreground">Version</span><span className="text-muted-foreground font-mono">1.0.0</span></div>
              <div className="flex items-center justify-between py-2 border-b border-border"><span className="text-foreground">Default Locale</span><span className="text-muted-foreground font-mono">DE</span></div>
              <div className="flex items-center justify-between py-2 border-b border-border"><span className="text-foreground">Default Theme</span><span className="text-muted-foreground font-mono">Dark</span></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
