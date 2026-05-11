import { useState } from "react";
import { HelpCircle, X, Type, FileText, Image, Link2, Search, ListOrdered, Bold, Eye } from "lucide-react";
import { useT } from "@/stores/i18nStore";

export default function AdminHelpButton() {
  const t = useT();
  const [open, setOpen] = useState(false);

  const sections = [
    {
      icon: Link2,
      title: "Slug (URL)",
      titleEn: "Slug (URL)",
      color: "#39FF14",
      tips: [
        "Das Haupt-Keyword kommt zuerst",
        "Nur Kleinbuchstaben und Bindestriche",
        "Keine Umlaute (ae statt ä)",
        "Max. 60 Zeichen",
        "Niemals ändern nach Veröffentlichung",
      ],
      examples: [
        { label: "Gut", text: "cannabis-anbau-anfaenger-guide" },
        { label: "Schlecht", text: "artikel-123" },
        { label: "Schlecht", text: "mein toller blog post" },
      ],
    },
    {
      icon: Type,
      title: "Titel",
      titleEn: "Title",
      color: "#FFD600",
      tips: [
        "Keyword am Anfang platzieren",
        "Max. 60 Zeichen (Google schneidet ab)",
        "Zahl + Benefit = Klickstark",
        "Jeder Titel muss eindeutig sein",
      ],
      examples: [
        { label: "Gut", text: "Cannabis Anbau: Der komplette Anfänger Guide 2025" },
        { label: "Gut", text: "LED Grow Lampe Test: Top 5 im Vergleich" },
        { label: "Schlecht", text: "Ein Guide über Cannabis" },
      ],
    },
    {
      icon: FileText,
      title: "Excerpt / Beschreibung",
      titleEn: "Excerpt / Description",
      color: "#39FF14",
      tips: [
        "150-160 Zeichen ideal",
        "Wird als Meta-Beschreibung genutzt",
        "Keyword natürlich einbauen",
        "Call-to-Action am Ende (z.B. 'Jetzt lesen!')",
      ],
      examples: [
        { label: "Gut", text: "Dein erster Cannabis-Anbau: Alles über Erde, Licht und Bewässerung. Schritt-für-Schritt zum erfolgreichen Grow." },
      ],
    },
    {
      icon: Bold,
      title: "Content (Inhalt)",
      titleEn: "Content",
      color: "#FFD600",
      tips: [
        "Mindestens 300 Wörter (besser 800+)",
        "Struktur mit # Überschriften",
        "## Zwischenüberschriften alle 2-3 Absätze",
        "Listen mit - oder 1. für Featured Snippets",
        "Fett mit **wichtige Begriffe**",
      ],
    },
    {
      icon: ListOrdered,
      title: "Markdown Formatierung",
      titleEn: "Markdown Formatting",
      color: "#8A8A8A",
      tips: [
        "# Hauptüberschrift",
        "## Zwischenüberschrift",
        "**fett** für Keywords",
        "- Listenpunkt",
        "1. Nummerierte Liste",
        "![Alt-Text](/bild.jpg) für Bilder",
      ],
    },
    {
      icon: Image,
      title: "Bilder",
      titleEn: "Images",
      color: "#39FF14",
      tips: [
        "Immer ein Featured Image setzen",
        "Alt-Text beschreibend mit Keyword",
        "Im Content: ![beschreibung](url)",
        "Werden automatisch komprimiert",
      ],
    },
    {
      icon: Eye,
      title: "Status",
      titleEn: "Status",
      color: "#FFD600",
      tips: [
        "Draft = nur Admin sichtbar",
        "Published = öffentlich + SEO + RSS",
        "Archived = ausgeblendet, URL bleibt",
        "Auf Published erst wenn fertig!",
      ],
    },
    {
      icon: Search,
      title: "Was passiert automatisch?",
      titleEn: "What happens automatically?",
      color: "#39FF14",
      tips: [
        "Sitemap.xml wird aktualisiert",
        "RSS Feed bekommt neuen Eintrag",
        "Schema.org JSON-LD wird generiert",
        "Open Graph Meta-Tags werden gesetzt",
        "BreadcrumbList für Google erstellt",
      ],
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted border border-border text-muted-foreground hover:text-[#39FF14] hover:border-[#39FF14]/30 hover:bg-[#39FF14]/10 transition-all"
        title={t("SEO Guide anzeigen", "Show SEO Guide")}
      >
        <HelpCircle size={15} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <HelpCircle size={20} className="text-[#39FF14]" />
                <h2 className="text-lg font-bold text-foreground font-heading">
                  {t("SEO & Posting Guide", "SEO & Posting Guide")}
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  "Folge diesen Richtlinien damit dein Beitrag bei Google optimal gelistet wird. Die technische SEO (Sitemap, Schema.org, RSS) läuft automatisch.",
                  "Follow these guidelines so your post ranks well on Google. Technical SEO (sitemap, schema.org, RSS) runs automatically."
                )}
              </p>

              {sections.map((section) => (
                <div key={section.title} className="border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                    <section.icon size={16} style={{ color: section.color }} />
                    <h3 className="text-sm font-bold text-foreground">
                      {section.title}
                    </h3>
                  </div>
                  <div className="px-4 py-3">
                    <ul className="space-y-1.5">
                      {section.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-[#39FF14] mt-1 shrink-0">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                    {section.examples && (
                      <div className="mt-3 space-y-1.5">
                        {section.examples.map((ex, i) => (
                          <div key={i} className="text-xs">
                            <span className={ex.label === "Gut" ? "text-[#39FF14] font-bold" : "text-[#FF4444] font-bold"}>
                              {ex.label}:
                            </span>
                            <code className="ml-2 text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {ex.text}
                            </code>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-lg px-4 py-3">
                <p className="text-xs text-[#39FF14] font-mono">
                  {t(
                    "Tipp: Schreibe den DE-Inhalt zuerst. EN kann nachgereicht werden.",
                    "Tip: Write the DE content first. EN can be added later."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
