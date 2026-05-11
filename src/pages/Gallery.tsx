import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Grid3X3, LayoutList } from "lucide-react";
import { useI18n, useT } from "@/stores/i18nStore";

import { trpc } from "@/providers/trpc";
import SafeImage from "@/components/SafeImage";
import SEO from "@/components/SEO";
import BackToHome from "@/components/BackToHome";

export default function Gallery() {
  const locale = useI18n((s) => s.locale);
  const t = useT();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const mediaQuery = trpc.media.list.useQuery({ tag: "gallery" });

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Galerie" description="Bilder aus der HomyHomegrow Community. Grow-Setups, Pflanzen und Ernten." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <BackToHome />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground font-heading uppercase tracking-tight">{t("Galerie", "Gallery")}</h1>
              <p className="mt-2 text-muted-foreground">{t("Bilder aus der Grow-Welt.", "Images from the grow world.")}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-[#39FF14] text-[#0A0A0A]" : "bg-card text-muted-foreground hover:bg-secondary"}`}><Grid3X3 size={18} /></button>
              <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-[#39FF14] text-[#0A0A0A]" : "bg-card text-muted-foreground hover:bg-secondary"}`}><LayoutList size={18} /></button>
            </div>
          </div>
        </motion.div>
        {viewMode === "grid" ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {mediaQuery.data?.items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.1 }} className="break-inside-avoid">
                <button onClick={() => setLightboxImage(item.url)} className="w-full group relative rounded-xl overflow-hidden border border-border hover:border-[#39FF14]/30 transition-all">
                  <SafeImage src={item.thumbnailUrl || item.url} alt={locale === "en" ? item.captionEn || item.filename : item.captionDe || item.filename} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" containerClassName="w-full" />
                  {(locale === "en" ? item.captionEn : item.captionDe) && <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"><p className="text-sm text-white">{locale === "en" ? item.captionEn : item.captionDe}</p></div>}
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaQuery.data?.items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.1 }}>
                <button onClick={() => setLightboxImage(item.url)} className="w-full group relative rounded-xl overflow-hidden border border-border hover:border-[#39FF14]/30 transition-all aspect-square">
                  <SafeImage src={item.thumbnailUrl || item.url} alt={locale === "en" ? item.captionEn || item.filename : item.captionDe || item.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" containerClassName="w-full h-full" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
        {mediaQuery.data?.items.length === 0 && <div className="text-center py-16"><Camera className="w-12 h-12 text-border mx-auto mb-4" /><p className="text-muted-foreground">{t("Keine Bilder vorhanden.", "No images yet.")}</p></div>}
      </div>
      <AnimatePresence>
        {lightboxImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
            <button className="absolute top-4 right-4 p-2 rounded-full bg-card text-foreground hover:bg-secondary transition-colors" onClick={() => setLightboxImage(null)}><X size={24} /></button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={lightboxImage} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
