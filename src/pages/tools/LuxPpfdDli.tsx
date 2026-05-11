import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import {
  ArrowLeft,
  Sun,
  Lightbulb,
  Zap,
  Info,
  Clock,
  Leaf,
  Flower2,
  Sprout,
  Wind,
  Atom,
  Moon,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/stores/i18nStore";
import SEO from "@/components/SEO";

/* ============================================
   LIGHT SOURCE CONVERSION FACTORS
   ============================================ */
const LIGHT_SOURCES = [
  { key: "led_full",  labelDe: "LED Full", labelEn: "LED Full",  factor: 0.020 },
  { key: "led_white", labelDe: "LED Weiß", labelEn: "LED White", factor: 0.018 },
  { key: "hps",       labelDe: "HPS",      labelEn: "HPS",       factor: 0.013 },
  { key: "mh",        labelDe: "MH",       labelEn: "MH",        factor: 0.016 },
  { key: "cfl",       labelDe: "CFL",      labelEn: "CFL",       factor: 0.014 },
  { key: "sun",       labelDe: "Sonne",    labelEn: "Sun",       factor: 0.018 },
];

/* ============================================
   PHASE CONFIG — NORMAL vs CO2 MODE
   ============================================ */
const PHASES = [
  {
    key: "seedling" as const,
    labelDe: "Setzling", labelEn: "Seedling", icon: Sprout,
    normal: { ppfdMin: 100, ppfdMax: 300, dliMin: 6,  dliMax: 15 },
    co2:    { ppfdMin: 150, ppfdMax: 400, dliMin: 10, dliMax: 20 },
    defaultHours: 18,
  },
  {
    key: "clone" as const,
    labelDe: "Steckling", labelEn: "Clone", icon: Wind,
    normal: { ppfdMin: 100, ppfdMax: 200, dliMin: 6,  dliMax: 12 },
    co2:    { ppfdMin: 150, ppfdMax: 350, dliMin: 10, dliMax: 18 },
    defaultHours: 18,
  },
  {
    key: "veg" as const,
    labelDe: "Vegi", labelEn: "Veg", icon: Leaf,
    normal: { ppfdMin: 200, ppfdMax: 600,  dliMin: 12, dliMax: 24 },
    co2:    { ppfdMin: 400, ppfdMax: 1000, dliMin: 24, dliMax: 48 },
    defaultHours: 18,
  },
  {
    key: "flower" as const,
    labelDe: "Blüte", labelEn: "Flower", icon: Flower2,
    normal: { ppfdMin: 400, ppfdMax: 1000, dliMin: 20, dliMax: 40 },
    co2:    { ppfdMin: 800, ppfdMax: 1600, dliMin: 40, dliMax: 80 },
    defaultHours: 12,
  },
];

/* ============================================
   CO2 PPM RECOMMENDATION
   ============================================ */
function co2ForPpfd(ppfd: number): number {
  if (ppfd < 200) return 400;
  if (ppfd < 400) return 800;
  if (ppfd < 600) return 1000;
  if (ppfd < 800) return 1200;
  if (ppfd < 1000) return 1400;
  return 1500;
}

/* ============================================
   ZONE HELPERS
   ============================================ */
const zoneColor = (z: string) =>
  z === "none" ? "#555" : z === "optimal" ? "#39FF14" : z === "low" ? "#38bdf8" : "#FF4444";

const zoneLabel = (z: string, t: (de: string, en: string) => string) =>
  z === "none"
    ? "\u2014"
    : z === "optimal"
    ? "\u2713 " + t("Optimal", "Optimal")
    : z === "low"
    ? "\u25BC " + t("Zu niedrig", "Too low")
    : "\u25B2 " + t("Zu hoch", "Too high");

/* ============================================
   MINI CO2 BADGE
   ============================================ */
function Co2Badge({ ppfd }: { ppfd: number }) {
  if (ppfd < 200) return null;
  const ppm = co2ForPpfd(ppfd);
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">
      <Atom size={10} />
      CO₂ {ppm} ppm
    </span>
  );
}

/* ============================================
   MAIN PAGE
   ============================================ */
export default function LuxPpfdDli() {
  const t = useT();
  const [lux, setLux]           = useState("");
  const [ppfd, setPpfd]         = useState("");
  const [lastEdited, setLastEdited] = useState<"lux" | "ppfd" | null>(null);
  const [sourceIdx, setSourceIdx]   = useState(0);
  const [lightHours, setLightHours] = useState(18);
  const [phaseIdx, setPhaseIdx]     = useState(2); // veg
  const [co2Mode, setCo2Mode]       = useState(false);

  const source = LIGHT_SOURCES[sourceIdx];
  const factor = source.factor;
  const phase  = PHASES[phaseIdx];

  /* ---- Limits depend on CO2 mode ---- */
  const limits = useMemo(() => (co2Mode ? phase.co2 : phase.normal), [co2Mode, phase]);

  /* ---- Calculations ---- */
  const luxNum  = lux  === "" ? 0 : Number(lux);
  const ppfdNum = ppfd === "" ? 0 : Number(ppfd);

  let displayLux  = luxNum;
  let displayPpfd = ppfdNum;

  if (lastEdited === "lux" && luxNum > 0) {
    displayPpfd = luxNum * factor;
  } else if (lastEdited === "ppfd" && ppfdNum > 0) {
    displayLux = ppfdNum / factor;
  }

  const activePpfd = lastEdited === "ppfd" ? ppfdNum : displayPpfd;
  const hasInput   = lux !== "" || ppfd !== "";
  const dli        = hasInput ? activePpfd * lightHours * 0.0036 : 0;

  /* ---- Zones use CO2-adjusted limits ---- */
  const ppfdZone = !hasInput
    ? "none"
    : activePpfd < limits.ppfdMin
    ? "low"
    : activePpfd > limits.ppfdMax
    ? "high"
    : "optimal";

  const dliZone = !hasInput
    ? "none"
    : dli < limits.dliMin
    ? "low"
    : dli > limits.dliMax
    ? "high"
    : "optimal";

  /* ---- Phase click: set hours to phase default ---- */
  const handlePhaseClick = (idx: number) => {
    setPhaseIdx(idx);
    setLightHours(PHASES[idx].defaultHours);
    // Phase stays locked — slider alone never changes phase
  };

  /* ---- SEO FAQ data ---- */
  const faqItems = [
    {
      q: t("Wie viele Lichtstunden brauchen Cannabis-Pflanzen?", "How many light hours do cannabis plants need?"),
      a: t(
        "Im Vegetativ-Stadium benötigen Cannabis-Pflanzen in der Regel 18 Stunden Licht pro Tag (18/6 Zyklus). Einige Grower fahren auch 20/4 oder sogar 24 Stunden durchgehend. In der Blüte-Phase sind 12 Stunden Licht standard (12/12 Zyklus). Autoflowering-Sorten können in der Blüte dagegen bis zu 24 Stunden Licht vertragen.",
        "In the vegetative stage, cannabis plants typically need 18 hours of light per day (18/6 cycle). Some growers run 20/4 or even 24 hours continuously. In flowering, 12 hours of light is standard (12/12 cycle). Autoflowering strains can tolerate up to 24 hours of light during flowering."
      ),
    },
    {
      q: t("Was ist der Unterschied zwischen Lux und PPFD?", "What is the difference between Lux and PPFD?"),
      a: t(
        "Lux misst die Helligkeit für das menschliche Auge. PPFD (Photosynthetic Photon Flux Density) misst die für Pflanzen nutzbaren Photonen im PAR-Bereich (400–700 nm). Eine Lux-Meter-App am Smartphone reicht für den Homegrow aus — mit dem Umrechnungsfaktor der jeweiligen Lichtquelle lässt sich PPFD berechnen.",
        "Lux measures brightness for the human eye. PPFD (Photosynthetic Photon Flux Density) measures usable photons for plants in the PAR range (400–700 nm). A lux meter app on your smartphone is sufficient for home growing — using the conversion factor of the respective light source, PPFD can be calculated."
      ),
    },
    {
      q: t("Was ist DLI und warum ist es wichtig?", "What is DLI and why is it important?"),
      a: t(
        "DLI (Daily Light Integral) ist die Gesamtmenge an Licht, die eine Pflanze pro Tag erhält. Die Formel lautet: PPFD × Lichtstunden × 0,0036 = DLI (in mol/m²/Tag). Der DLI-Wert ist der wichtigste Parameter für die Lichtplanung im Cannabis-Anbau, da er direkt mit dem Ertrag korreliert.",
        "DLI (Daily Light Integral) is the total amount of light a plant receives per day. The formula is: PPFD × light hours × 0.0036 = DLI (in mol/m²/day). The DLI value is the most important parameter for light planning in cannabis growing, as it directly correlates with yield."
      ),
    },
    {
      q: t("Kann ich mit CO₂ mehr Licht geben?", "Can I give more light with CO₂?"),
      a: t(
        "Ja! Mit CO₂-Anreicherung (800–1500 ppm) erhöht sich die Photosynthese-Rate deutlich. Dadurch können Pflanzen viel mehr Licht verarbeiten: Im Vegi bis zu 1000 PPFD (statt 600) und im Blüte bis zu 1600 PPFD (statt 1000). Der DLI kann sich damit verdoppeln — und mit ihm der Ertrag. Voraussetzung ist eine geschlossene Growbox und ein CO₂-System.",
        "Yes! With CO₂ supplementation (800–1500 ppm), the photosynthesis rate increases significantly. Plants can process much more light: up to 1000 PPFD in veg (instead of 600) and up to 1600 PPFD in flower (instead of 1000). DLI can double — and with it the yield. Requires a sealed grow tent and a CO₂ system."
      ),
    },
    {
      q: t("Wie viel DLI brauchen Autoflowers?", "How much DLI do autoflowers need?"),
      a: t(
        "Autoflowering-Sorten vertragen in allen Phasen mehr Licht als Photoperioden-Sorten. Da sie oft 18–24 Stunden Licht bekommen, liegt der DLI entsprechend höher. Ein typischer Autoflower-Grow mit 20h Licht und 500 PPFD ergibt einen DLI von etwa 36 mol/m²/Tag — das ist im optimalen Bereich.",
        "Autoflowering strains tolerate more light in all phases than photoperiod strains. Since they often receive 18–24 hours of light, DLI is correspondingly higher. A typical autoflower grow with 20h light and 500 PPFD yields a DLI of about 36 mol/m²/day — which is in the optimal range."
      ),
    },
  ];

  return (
    <>
      <SEO
        title={t(
          "Lux zu PPFD & DLI Rechner für Cannabis | Lichtstunden & CO₂ Pro-Modus",
          "Lux to PPFD & DLI Calculator for Cannabis | Light Hours & CO₂ Pro Mode"
        )}
        description={t(
          "Kostenloser Lux-zu-PPFD-und-DLI-Rechner für Cannabis-Anbau. Mit Lichtstunden-Planer (12h Blüte, 18h Vegi, 24h Autoflower) und CO₂ Pro-Modus für erhöhte DLI-Limits. Optimal für LED, HPS, MH & CFL.",
          "Free Lux to PPFD and DLI calculator for cannabis growing. With light hour planner (12h flower, 18h veg, 24h autoflower) and CO₂ Pro Mode for elevated DLI limits. Optimal for LED, HPS, MH & CFL."
        )}
        keywords={t(
          "Lux PPFD Rechner, DLI Calculator Cannabis, Lichtstunden Cannabis, 12 12 Blüte, 18 6 Vegi, Autoflower Licht, CO₂ Cannabis, PPFD LED, Cannabis Grow Rechner, Tageslichtintegral",
          "Lux PPFD calculator, DLI calculator cannabis, light hours cannabis, 12 12 flowering, 18 6 veg, autoflower light, CO2 cannabis, PPFD LED, cannabis grow calculator, daily light integral"
        )}
        canonical="https://homyhomegrow.de/tools/lux-ppfd-dli"
      />

      <main className="mx-auto max-w-3xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* ---------- Breadcrumb ---------- */}
        <nav className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-4">
          <ol className="flex items-center gap-1">
            <li><Link to="/" className="hover:text-[#39FF14]">{t("Home", "Home")}</Link></li>
            <li>/</li>
            <li><Link to="/tools" className="hover:text-[#39FF14]">{t("Tools", "Tools")}</Link></li>
            <li>/</li>
            <li className="text-[#39FF14]">Lux → PPFD → DLI</li>
          </ol>
        </nav>

        {/* ---------- Header ---------- */}
        <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 sm:mb-6">
          <div className="flex items-center gap-2">
            <Link to="/tools">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0"><ArrowLeft size={14} /></Button>
            </Link>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground font-heading flex items-center gap-1.5">
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-[#39FF14]" />
                Lux → PPFD → DLI
              </h1>
              <p className="text-[10px] sm:text-sm text-muted-foreground">
                {t("Lichtrechner für Cannabis-Anbau mit Beleuchtungszeit-Planer", "Light calculator for cannabis growing with lighting schedule planner")}
              </p>
            </div>
          </div>
        </motion.header>

        {/* ======================================
            COMPACT INPUT + RESULT SECTION
            ====================================== */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-xl p-3 sm:p-4 space-y-3"
        >
          {/* --- Lux Input --- */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-foreground mb-1">
              <Sun size={12} className="text-[#39FF14]" />
              {t("Lux-Messung", "Lux Reading")}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number" min={0} max={200000} value={lux}
                onChange={e => { setLux(e.target.value); setLastEdited("lux"); }}
                className="text-base font-mono h-9" placeholder="0"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">lux</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {t("Smartphone Lux-App oder Lux-Meter", "Smartphone lux app or lux meter")}
            </p>
          </div>

          {/* --- PPFD Result Card --- */}
          <AnimatePresence>
            {hasInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-black/30 border border-[#39FF14]/30 rounded-lg p-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Zap size={12} className="text-[#39FF14]" />
                      <span className="text-xs text-muted-foreground">PPFD</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Co2Badge ppfd={activePpfd} />
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${zoneColor(ppfdZone)}20`, color: zoneColor(ppfdZone) }}
                      >
                        {zoneLabel(ppfdZone, t)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-bold font-mono" style={{ color: zoneColor(ppfdZone) }}>
                      {activePpfd.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">μmol/m²/s</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {limits.ppfdMin}-{limits.ppfdMax} {t("Ziel", "Target")}
                      {co2Mode && <span className="text-[#39FF14] ml-1 font-bold">CO₂</span>}
                    </span>
                  </div>
                  {lastEdited === "lux" && luxNum > 0 && (
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      {luxNum.toLocaleString()} lux × {factor} = {displayPpfd.toFixed(1)} PPFD
                    </p>
                  )}
                  {lastEdited === "ppfd" && ppfdNum > 0 && (
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      ≈ {displayLux.toFixed(0)} lux mit {t(source.labelDe, source.labelEn)}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- PPFD Input --- */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-foreground mb-1">
              <Zap size={12} className="text-[#39FF14]" />
              PPFD {t("(direkt)", "(direct)")}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number" min={0} max={3000} value={ppfd}
                onChange={e => { setPpfd(e.target.value); setLastEdited("ppfd"); }}
                className="text-base font-mono h-9" placeholder="0"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">μmol/m²/s</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {t("PAR-Meter Messung direkt eingeben", "Enter PAR meter reading directly")}
            </p>
          </div>

          {/* --- Light Hours Slider + Phase Buttons --- */}
          <div className="pt-1">
            <div className="relative h-5 mb-0.5">
              <div
                className="absolute top-0 -translate-x-1/2 bg-[#39FF14] text-[#0A0A0A] text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow shadow-[#39FF14]/30 transition-all"
                style={{ left: `${((lightHours - 1) / 23) * 100}%` }}
              >
                {lightHours}h
              </div>
            </div>
            <input
              type="range" min={1} max={24} value={lightHours}
              onChange={e => setLightHours(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border accent-[#39FF14]"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-muted-foreground">1h</span>
              <div className="flex gap-1">
                {PHASES.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.key}
                      onClick={() => handlePhaseClick(i)}
                      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-all leading-none ${
                        phaseIdx === i
                          ? "border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon size={10} />
                      {t(p.labelDe, p.labelEn)}
                    </button>
                  );
                })}
              </div>
              <span className="text-[9px] text-muted-foreground">24h</span>
            </div>
          </div>

          {/* --- Light Source --- */}
          <div className="pt-1">
            <label className="flex items-center gap-1 text-xs font-medium text-foreground mb-1.5">
              <Lightbulb size={12} className="text-[#39FF14]" />
              {t("Lichtquelle", "Light Source")}
            </label>
            <div className="flex flex-wrap gap-1">
              {LIGHT_SOURCES.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => setSourceIdx(i)}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-all leading-none ${
                    sourceIdx === i
                      ? "border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(s.labelDe, s.labelEn)}
                </button>
              ))}
            </div>
          </div>

          {/* ============================================
              CO₂ PRO MODE TOGGLE
              ============================================ */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-lg p-2.5">
            <div className="flex items-center gap-2">
              <Atom size={14} className={co2Mode ? "text-[#39FF14]" : "text-muted-foreground"} />
              <div>
                <span className={`text-xs font-bold ${co2Mode ? "text-[#39FF14]" : "text-foreground"}`}>
                  {co2Mode
                    ? t("\u{1F680} CO₂ PRO MODUS AKTIV", "\u{1F680} CO₂ PRO MODE ACTIVE")
                    : t("CO₂ Pro-Modus", "CO₂ Pro Mode")}
                </span>
                <p className="text-[9px] text-muted-foreground">
                  {co2Mode
                    ? t("Erhöhte PPFD & DLI Limits — für Pros mit CO₂-Anlage", "Higher PPFD & DLI limits — for pros with CO₂ supplementation")
                    : t("Schalte um für höhere Lichtschwellen mit CO₂", "Toggle for higher light thresholds with CO₂")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCo2Mode(!co2Mode)}
              className={`relative w-12 h-6 rounded-full transition-all ${co2Mode ? "bg-[#39FF14]" : "bg-muted"}`}
              aria-label="CO2 Mode Toggle"
            >
              <motion.div
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow"
                animate={{ x: co2Mode ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* --- DLI Result Card --- */}
          <AnimatePresence>
            {hasInput && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <div className={`rounded-xl p-3 sm:p-4 ${
                  co2Mode
                    ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/40"
                    : "bg-gradient-to-br from-[#39FF14]/10 to-[#39FF14]/5 border border-[#39FF14]/40"
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Sun size={14} className={co2Mode ? "text-blue-400" : "text-[#39FF14]"} />
                      <span className="text-xs font-medium text-foreground">DLI</span>
                      <span className="text-[10px] text-muted-foreground">
                        ({t("Tageslichtintegral", "Daily Light Integral")})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {co2Mode && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">CO₂</span>
                      )}
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${zoneColor(dliZone)}20`, color: zoneColor(dliZone) }}
                      >
                        {zoneLabel(dliZone, t)}
                      </span>
                    </div>
                  </div>
                  <div className="text-center py-1">
                    <span className={`text-3xl sm:text-4xl font-bold font-mono ${co2Mode ? "text-blue-400" : "text-[#39FF14]"}`}>
                      {dli.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">mol/m²/Tag</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/50 pt-2 mt-1">
                    <span>
                      {t("Ziel", "Target")} {phase.labelDe}: {limits.dliMin}-{limits.dliMax} mol/m²/Tag
                      {co2Mode && <span className="text-blue-400 ml-1 font-bold">↑ CO₂</span>}
                    </span>
                    <span className={co2Mode ? "text-blue-400" : "text-[#39FF14]"}>
                      {activePpfd.toFixed(0)} PPFD × {lightHours}h × 0.0036
                    </span>
                  </div>
                  {dliZone === "optimal" && (
                    <p className="text-[9px] text-[#39FF14]/70 mt-1 text-center">
                      {co2Mode
                        ? t("Optimaler DLI-Bereich für CO₂-angereichertes Wachstum!", "Optimal DLI range for CO₂-enriched growth!")
                        : t("Optimal! Für höhere Erträge probiere den CO₂ Pro-Modus.", "Optimal! For higher yields, try the CO₂ Pro Mode.")}
                    </p>
                  )}
                  {dliZone === "low" && (
                    <p className="text-[9px] text-blue-400/70 mt-1 text-center">
                      {t("Erhöhe Lichtstärke oder Stunden", "Increase light intensity or hours")}
                    </p>
                  )}
                  {dliZone === "high" && (
                    <p className="text-[9px] text-red-400/70 mt-1 text-center">
                      {t("Achtung: Zu hohes DLI kann stressen.", "Warning: DLI too high can cause stress.")}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- CO₂ PPM Display --- */}
          <AnimatePresence>
            {hasInput && activePpfd >= 200 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Atom size={10} />
                    {t("Empfohlene CO₂-Konzentration", "Recommended CO₂ concentration")}:
                  </span>
                  <span className="font-bold text-blue-400">
                    {co2ForPpfd(activePpfd)} ppm
                    {co2Mode && <span className="text-[#39FF14] ml-1">✓ aktiv</span>}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ======================================
            EXPLANATION
            ====================================== */}
        <motion.section
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-3 sm:mt-6 bg-card border border-border rounded-xl p-3 sm:p-4"
        >
          <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
            <Info size={14} className="text-[#39FF14]" />
            {t("Erklärung", "Explanation")}
          </h3>
          <div className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Lux</strong> —{" "}
              {t("Helligkeits-Messeinheit. Jeder hat ein Lux-Meter im Handy!", "Brightness unit. Everyone has a lux meter in their phone!")}
            </p>
            <p>
              <strong className="text-foreground">PPFD</strong> —{" "}
              {t("Photosynthetisch aktive Photonen pro m²/s. Das nutzt die Pflanze wirklich.", "Photosynthetically active photons per m²/s. What the plant actually uses.")}
            </p>
            <p>
              <strong className="text-foreground">DLI</strong> —{" "}
              {t("Gesamt-Lichtmenge pro Tag. PPFD × Stunden × 0.0036 = DLI. Der wichtigste Wert!", "Total light per day. PPFD × hours × 0.0036 = DLI. The most important value!")}
            </p>

            {/* CO₂ Pro Mode explanation */}
            <div className="pt-2 border-t border-border">
              <p className="text-[#39FF14] font-bold mb-1 flex items-center gap-1">
                <Atom size={12} />
                {t("CO₂ Pro-Modus", "CO₂ Pro Mode")} — {t("Für Profi-Grower", "For pro growers")}
              </p>
              <p>
                {t(
                  "Mit CO₂-Anreicherung (800–1500 ppm) können Pflanzen deutlich mehr Licht verarbeiten. Der Pro-Modus passt alle Zielbereiche entsprechend an.",
                  "With CO₂ supplementation (800–1500 ppm), plants can process significantly more light. Pro Mode adjusts all target ranges accordingly."
                )}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <div className="bg-black/20 rounded p-1.5">
                  <span className="text-[9px] text-muted-foreground">{t("Standard", "Standard")} Vegi</span>
                  <p className="text-xs font-mono">PPFD 200–600 | DLI 12–24</p>
                </div>
                <div className="bg-blue-500/10 rounded p-1.5 border border-blue-500/20">
                  <span className="text-[9px] text-blue-400 font-bold">CO₂ Vegi</span>
                  <p className="text-xs font-mono text-blue-400">PPFD 400–1000 | DLI 24–48</p>
                </div>
                <div className="bg-black/20 rounded p-1.5">
                  <span className="text-[9px] text-muted-foreground">{t("Standard", "Standard")} Blüte</span>
                  <p className="text-xs font-mono">PPFD 400–1000 | DLI 20–40</p>
                </div>
                <div className="bg-blue-500/10 rounded p-1.5 border border-blue-500/20">
                  <span className="text-[9px] text-blue-400 font-bold">CO₂ Blüte</span>
                  <p className="text-xs font-mono text-blue-400">PPFD 800–1600 | DLI 40–80</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ======================================
            LIGHTING SCHEDULE GUIDE (NEW)
            ====================================== */}
        <motion.section
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="mt-3 sm:mt-6 bg-card border border-border rounded-xl p-3 sm:p-4"
        >
          <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Clock size={14} className="text-[#39FF14]" />
            {t("Beleuchtungszeiten im Cannabis-Anbau", "Lighting Schedules in Cannabis Growing")}
          </h3>

          <div className="space-y-3">
            {/* Vegi */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                <Sun size={16} className="text-green-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  {t("Vegetative Phase", "Vegetative Phase")}
                  <span className="text-green-400 font-mono ml-1.5">18/6 {t("bis", "to")} 24/0</span>
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  {t(
                    "Standard ist ein 18/6 Zyklus (18 Stunden Licht, 6 Stunden Dunkelheit). Einige Grower setzen 20/4 oder sogar 24 Stunden durchgehendes Licht ein — besonders bei Stecklingen und Setzlingen fördert das schnelles Wurzelwachstum. In der Vegi-Phase gibt es keine generelle Obergrenze, da die Pflanze ohne Dunkelphase ebenso gedeiht.",
                    "Standard is an 18/6 cycle (18 hours light, 6 hours dark). Some growers run 20/4 or even 24 hours of continuous light — especially for clones and seedlings, this promotes rapid root growth. In the vegetative phase, there is no general upper limit, as the plant thrives without a dark period."
                  )}
                </p>
                <p className="text-[10px] text-green-400/80 mt-1">
                  {t("💡 Tipp: Setzlinge & Stecklinge profitieren von 20–24h Licht für maximales Wachstum.", "💡 Tip: Seedlings & clones benefit from 20–24h light for maximum growth.")}
                </p>
              </div>
            </div>

            {/* Blüte */}
            <div className="flex gap-3 pt-2 border-t border-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center">
                <Moon size={16} className="text-rose-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  {t("Blüte-Phase (Photoperioden)", "Flowering Phase (Photoperiod)")}
                  <span className="text-rose-400 font-mono ml-1.5">12/12</span>
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  {t(
                    "Die Blüte wird durch den Wechsel auf 12 Stunden Licht und 12 Stunden Dunkelheit eingeleitet. Dieser Licht-Reiz signalisiert der Pflanze den Herbst und löst die Blütenbildung aus. Die 12 Stunden Dunkelphase darf nicht unterbrochen werden — Lichtlecks können Hermaphroditismus verursachen und die Ernte ruinieren.",
                    "Flowering is initiated by switching to 12 hours of light and 12 hours of darkness. This light stimulus signals autumn to the plant and triggers flower formation. The 12-hour dark period must not be interrupted — light leaks can cause hermaphroditism and ruin the harvest."
                  )}
                </p>
                <p className="text-[10px] text-rose-400/80 mt-1">
                  {t("⚠️ Achtung: Nie während der 12h Dunkelphase Licht ins Grow-Zelt lassen!", "⚠️ Warning: Never let light into the grow tent during the 12h dark period!")}
                </p>
              </div>
            </div>

            {/* Autoflower */}
            <div className="flex gap-3 pt-2 border-t border-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                <Timer size={16} className="text-purple-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  {t("Autoflowering-Sorten", "Autoflowering Strains")}
                  <span className="text-purple-400 font-mono ml-1.5">18/6 {t("bis", "to")} 24/0</span>
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  {t(
                    "Autoflowers blühen automatisch nach einer genetisch festgelegten Zeit und benötigen keinen Lichtzyklus-Wechsel. Daher können sie in der Blüte weiterhin 18–24 Stunden Licht erhalten. Die meisten Autoflower-Grower nutzen 18/6, 20/4 oder 24/0 durchgehend — höhere Lichtstunden bedeuten mehr DLI und damit mehr Ertrag. Mit 20h Licht und 600 PPFD erreicht man bereits einen DLI von ~43 mol/m²/Tag.",
                    "Autoflowers flower automatically after a genetically predetermined time and do not require a light cycle change. Therefore, they can continue to receive 18–24 hours of light during flowering. Most autoflower growers use 18/6, 20/4, or continuous 24/0 — more light hours means more DLI and thus more yield. With 20h light and 600 PPFD, you already achieve a DLI of ~43 mol/m²/day."
                  )}
                </p>
                <p className="text-[10px] text-purple-400/80 mt-1">
                  {t("🚀 Vorteil: Kein Lichtwechsel nötig — von Anfang bis Ende durchleuchten!", "🚀 Advantage: No light change needed — light continuously from start to finish!")}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ======================================
            FAQ SECTION (SEO boost)
            ====================================== */}
        <motion.section
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-3 sm:mt-6 bg-card border border-border rounded-xl p-3 sm:p-4"
        >
          <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <Info size={14} className="text-[#39FF14]" />
            {t("Häufige Fragen", "Frequently Asked Questions")}
          </h3>
          <dl className="space-y-3" itemScope itemType="https://schema.org/FAQPage">
            {faqItems.map((faq, i) => (
              <div key={i} className="border-b border-border last:border-0 pb-3 last:pb-0" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <dt className="text-xs font-medium text-foreground mb-1" itemProp="name">{faq.q}</dt>
                <dd className="text-[11px] text-muted-foreground leading-relaxed" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <span itemProp="text">{faq.a}</span>
                </dd>
              </div>
            ))}
          </dl>
        </motion.section>

        {/* ======================================
            PRO TIP + FOOTER CTA
            ====================================== */}
        <motion.section
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="mt-3 sm:mt-6 text-center py-4 border border-dashed border-[#39FF14]/30 rounded-xl bg-[#39FF14]/5"
        >
          <p className="text-sm text-foreground font-medium mb-1">
            {t("Mehr Tools für deinen Grow?", "More tools for your grow?")}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {t("VPD-Rechner, Stromkosten-Rechner und mehr auf HomyHomegrow.", "VPD calculator, power cost calculator and more on HomyHomegrow.")}
          </p>
          <Link to="/tools">
            <Button variant="outline" size="sm">{t("Alle Tools ansehen", "View all tools")}</Button>
          </Link>
        </motion.section>
      </main>
    </>
  );
}
