import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import {
  ArrowLeft,
  Droplets,
  Thermometer,
  Leaf,
  Flower2,
  Info,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { useT } from "@/stores/i18nStore";

/* ============================================
   VPD MATH
   ============================================ */
function svp(t: number): number {
  return 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
}

function vpdAir(temp: number, rh: number): number {
  return svp(temp) - svp(temp) * (rh / 100);
}

function vpdLeaf(airTemp: number, leafTemp: number, rh: number): number {
  return svp(leafTemp) - svp(airTemp) * (rh / 100);
}

/* ============================================
   OPTIMAL RANGES
   ============================================ */
const RANGES = {
  vegetative: { low: 0.4, high: 1.0, labelDe: "Vegetativ", labelEn: "Vegetative" },
  flowering: { low: 1.0, high: 1.6, labelDe: "Blüte", labelEn: "Flowering" },
  lateFlowering: { low: 1.4, high: 2.0, labelDe: "Spätblüte", labelEn: "Late Flowering" },
};

const BAR_MIN = 0;
const BAR_MAX = 2.5;

/* ============================================
   PHASE CONFIG
   ============================================ */
const PHASES = [
  {
    key: "vegetative" as const,
    labelDe: "Vegetativ",
    labelEn: "Vegetative",
    icon: Leaf,
    color: "green",
    tempMin: 20, tempMax: 28, rhMin: 60, rhMax: 80,
  },
  {
    key: "flowering" as const,
    labelDe: "Blüte",
    labelEn: "Flowering",
    icon: Droplets,
    color: "rose",
    tempMin: 22, tempMax: 28, rhMin: 40, rhMax: 60,
  },
  {
    key: "lateFlowering" as const,
    labelDe: "Spätblüte",
    labelEn: "Late Flowering",
    icon: Flower2,
    color: "purple",
    tempMin: 20, tempMax: 26, rhMin: 30, rhMax: 50,
  },
];

const PHASE_BTN: Record<string, string> = {
  green:  "bg-green-500/15 text-green-500 border-green-500/30",
  rose:   "bg-rose-500/15 text-rose-500 border-rose-500/30",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

/* ============================================
   ZONE HELPERS
   ============================================ */
const zoneColor = (z: string) =>
  z === "optimal" ? "#39FF14" : z === "low" ? "#38bdf8" : "#FF4444";

const zoneLabel = (z: string, t: (de: string, en: string) => string) =>
  z === "optimal"
    ? "\u2713 " + t("Optimal", "Optimal")
    : z === "low"
    ? "\u25BC " + t("Zu niedrig", "Too low")
    : "\u25B2 " + t("Zu hoch", "Too high");

const zoneAdvice = (z: string, range: { low: number; high: number }, t: (de: string, en: string) => string) =>
  z === "optimal"
    ? t(`Perfekt! Nährstoffaufnahme optimal (${range.low}-${range.high} kPa).`, `Perfect! Nutrient uptake optimal (${range.low}-${range.high} kPa).`)
    : z === "low"
    ? t(`LF senken oder Temp. erhöhen. Ziel: ${range.low}-${range.high} kPa.`, `Lower RH or raise temp. Target: ${range.low}-${range.high} kPa.`)
    : t(`LF erhöhen oder Temp. senken. Ziel: ${range.low}-${range.high} kPa.`, `Raise RH or lower temp. Target: ${range.low}-${range.high} kPa.`);

/* ============================================
   COMPACT VPD COLOR BAR
   ============================================ */
function VpdBar({ value, phaseKey }: { value: number; phaseKey: "vegetative" | "flowering" | "lateFlowering" }) {
  const range = RANGES[phaseKey];
  const lowPct = ((range.low - BAR_MIN) / (BAR_MAX - BAR_MIN)) * 100;
  const highPct = ((range.high - BAR_MIN) / (BAR_MAX - BAR_MIN)) * 100;
  const pointerPct = Math.min(100, Math.max(0, ((value - BAR_MIN) / (BAR_MAX - BAR_MIN)) * 100));
  const zone = value < range.low ? "low" : value > range.high ? "high" : "optimal";
  const ptrColor = zone === "optimal" ? "#16a34a" : zone === "low" ? "#1d4ed8" : "#b91c1c";

  return (
    <div className="space-y-1.5">
      {/* Compact Legend */}
      <div className="flex items-center gap-2 text-[9px]">
        <span className="inline-flex items-center gap-1 text-blue-400 font-medium">
          <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />
          &lt;{range.low}
        </span>
        <span className="inline-flex items-center gap-1 text-green-400 font-medium">
          <span className="w-2 h-2 rounded-sm bg-green-500 inline-block" />
          {range.low}-{range.high}
        </span>
        <span className="inline-flex items-center gap-1 text-red-400 font-medium">
          <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" />
          &gt;{range.high}
        </span>
      </div>

      {/* Bar */}
      <div
        className="relative h-5 rounded-full border border-white/10 overflow-visible"
        style={{
          background: `linear-gradient(90deg, #2563eb 0%, #38bdf8 ${Math.max(0, lowPct - 8)}%, #4ade80 ${lowPct}%, #39FF14 ${lowPct + (highPct - lowPct) / 2}%, #4ade80 ${highPct}%, #f87171 ${Math.min(100, highPct + 8)}%, #ef4444 100%)`,
        }}
      >
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-10"
          style={{ left: `${pointerPct}%` }}
          initial={false}
          animate={{ left: `${pointerPct}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{
              backgroundColor: ptrColor,
              border: "2px solid #0a0a0a",
              boxShadow: `0 0 4px ${ptrColor}, 0 0 8px ${ptrColor}`,
            }}
          />
        </motion.div>
      </div>

      {/* Scale */}
      <div className="relative h-2">
        <span className="absolute left-0 text-[9px] text-blue-400/60">0.0</span>
        <span className="absolute -translate-x-1/2 text-[9px] text-blue-400" style={{ left: `${lowPct}%` }}>
          {range.low}
        </span>
        <span className="absolute -translate-x-1/2 text-[9px] text-green-400" style={{ left: `${highPct}%` }}>
          {range.high}
        </span>
        <span className="absolute right-0 text-[9px] text-red-400/60">{BAR_MAX.toFixed(1)}</span>
      </div>
    </div>
  );
}

/* ============================================
   INLINE KEYFRAMES (for slider + bar)
   ============================================ */
const glowAnimations = `
  @keyframes barPulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
`;

/* ============================================
   COMPACT RANGE SLIDER with DYNAMIC WARN COLORS
   ============================================ */
function RangeSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  icon: Icon,
  onChange,
  optMin,
  optMax,
  optLabel,
  vpdZone,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  icon: any;
  onChange: (v: number) => void;
  optMin?: number;
  optMax?: number;
  optLabel?: string;
  vpdZone?: "optimal" | "low" | "high";
}) {
  const optLeft = optMin !== undefined ? ((optMin - min) / (max - min)) * 100 : 0;
  const optWidth = optMin !== undefined && optMax !== undefined ? ((optMax - optMin) / (max - min)) * 100 : 0;

  // Dynamic warn color based on VPD zone
  const isWarn = vpdZone === "low" || vpdZone === "high";
  const warnColor = vpdZone === "low" ? "38,130,246" : vpdZone === "high" ? "239,68,68" : "57,255,20";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1 text-xs font-medium text-foreground">
          <Icon size={12} className="text-[#39FF14]" />
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          {optLabel && (
            <span
              className={`text-[9px] px-1 py-0.5 rounded font-medium ${
                isWarn
                  ? "bg-red-500/20 text-red-400"
                  : optLabel === "OK" || optLabel === "Typisch"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {isWarn ? "VPD Warn" : optLabel}
            </span>
          )}
          <span className="text-xs font-mono font-bold text-[#39FF14]">
            {value.toFixed(step < 1 ? 1 : 0)}
            {unit}
          </span>
        </div>
      </div>
      {/* Slider with animated, zone-colored optimal range */}
      <div className="relative" style={{ touchAction: "none" }}>
        {optMin !== undefined && optMax !== undefined && (
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${optLeft}%`,
              width: `${optWidth}%`,
              top: "50%",
              transform: "translateY(-50%)",
              height: "8px",
              background: `linear-gradient(90deg, rgba(${warnColor},0.4), rgba(${warnColor},0.7), rgba(${warnColor},0.4))`,
              zIndex: 1,
              pointerEvents: "none",
              boxShadow: `0 0 6px rgba(${warnColor},0.5), 0 0 12px rgba(${warnColor},0.3)`,
              animation: "barPulse 1.2s ease-in-out infinite",
            }}
          />
        )}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border accent-[#39FF14]"
          style={{ zIndex: 10, position: "relative" }}
          aria-label={label}
        />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>
          {min}
          {unit}
        </span>
        {optMin !== undefined && optMax !== undefined && (
          <span className={isWarn ? "text-red-400/80" : "text-[#39FF14]/60"}>
            {isWarn ? "Check VPD" : `${optMin}-${optMax}${unit}`}
          </span>
        )}
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

/* ============================================
   VPD CALCULATOR PAGE
   ============================================ */
export default function VpdCalculator() {
  const t = useT();
  const [phase, setPhase] = useState<"vegetative" | "flowering" | "lateFlowering">("vegetative");
  const [temp, setTemp] = useState(25);
  const [rh, setRh] = useState(55);
  const [leafTempOffset, setLeafTempOffset] = useState(-2);
  const [showLeafVpd, setShowLeafVpd] = useState(false);

  const airVpd = useMemo(() => vpdAir(temp, rh), [temp, rh]);
  const leafVpd = useMemo(() => vpdLeaf(temp, temp + leafTempOffset, rh), [temp, leafTempOffset, rh]);
  const range = RANGES[phase];
  const vpdZone = airVpd < range.low ? "low" : airVpd > range.high ? "high" : "optimal";

  const phaseCfg = PHASES.find((p) => p.key === phase)!;

  /* ---- FAQ ---- */
  const faqItems = [
    {
      q: t("Was ist VPD?", "What is VPD?"),
      a: t(
        "VPD (Vapor Pressure Deficit) beschreibt den Druckunterschied zwischen der maximal möglichen Feuchtigkeit in der Luft und der tatsächlichen. Er gibt an, wie stark eine Pflanze transpireiert und Nährstoffe aufnehmen kann.",
        "VPD describes the pressure difference between max possible moisture in air and actual moisture. It indicates how much a plant transpires and absorbs nutrients."
      ),
    },
    {
      q: t("Was ist der optimale VPD beim Cannabis-Anbau?", "What is the optimal VPD for cannabis?"),
      a: t(
        "Vegetativ 0.4–1.0 kPa, Blüte 1.0–1.6 kPa, Spätblüte 1.4–2.0 kPa. Bis 1.6 kPa in der Regel gefahrlos.",
        "Vegetative 0.4–1.0 kPa, Flowering 1.0–1.6 kPa, Late Flowering 1.4–2.0 kPa. Up to 1.6 kPa usually safe."
      ),
    },
    {
      q: t("Wie berechne ich den VPD?", "How do I calculate VPD?"),
      a: t(
        "VPD wird aus Raumtemperatur und relativer Luftfeuchtigkeit berechnet. Unser Rechner gibt Luft-VPD und optional Blatt-VPD aus.",
        "VPD is calculated from room temperature and relative humidity. Our calculator gives air VPD and optionally leaf VPD."
      ),
    },
    {
      q: t("Wie erkenne ich ob der VPD stimmt?", "How do I know if VPD is right?"),
      a: t(
        "Blattspannung ist der beste Indikator: Gesunde Blätter stehen ~90° zum Stiel. Schlaff herunter = VPD zu niedrig. Steil nach oben = VPD zu hoch.",
        "Leaf tension is the best indicator: Healthy leaves stand ~90° to stem. Limp downward = VPD too low. Steep upward = VPD too high."
      ),
    },
    {
      q: t("Was passiert bei zu niedrigem VPD?", "What if VPD is too low?"),
      a: t(
        "Die Pflanze transpireiert nicht genug. Nährstoffaufnahme stockt, Blätter hängen schlaff, Wachstum verlangsamt sich.",
        "Plant doesn't transpire enough. Nutrient uptake stalls, leaves hang limply, growth slows."
      ),
    },
    {
      q: t("Was passiert bei zu hohem VPD?", "What if VPD is too high?"),
      a: t(
        "Die Pflanze verliert zu viel Wasser. Blattrandverbrennungen, Stress, schlaffe Blätter. Bis 1.6 kPa gefahrlos, darüber vorsichtig!",
        "Plant loses too much water. Leaf edge burns, stress, limp leaves. Up to 1.6 kPa safe, above that be careful!"
      ),
    },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: glowAnimations }} />
      <SEO
        title={t("VPD-Rechner Cannabis | Kostenlos Online", "VPD Calculator Cannabis | Free Online")}
        description={t(
          "Berechne VPD für deinen Cannabis-Anbau. Optimal: Vegetativ 0.4-1.0 kPa, Blüte 1.0-1.6 kPa, Spätblüte 1.4-2.0 kPa. Mit Blatt-VPD für Profis.",
          "Calculate VPD for your cannabis grow. Optimal: Veg 0.4-1.0 kPa, Flower 1.0-1.6 kPa, Late Flower 1.4-2.0 kPa. With leaf VPD for pros."
        )}
        keywords={t(
          "VPD Rechner, Vapor Pressure Deficit, Cannabis Anbau, VPD berechnen, Luftfeuchtigkeit Cannabis, optimale VPD Werte, Cannabis Grow Rechner",
          "VPD calculator, vapor pressure deficit, cannabis growing, calculate VPD, humidity cannabis, optimal VPD values, cannabis grow calculator"
        )}
        canonical="https://homyhomegrow.de/tools/vpd-calculator"
      />

      <main className="mx-auto max-w-3xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* ---------- Breadcrumb ---------- */}
        <nav className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-4">
          <ol className="flex items-center gap-1">
            <li><Link to="/" className="hover:text-[#39FF14]">{t("Home", "Home")}</Link></li>
            <li>/</li>
            <li><Link to="/tools" className="hover:text-[#39FF14]">{t("Tools", "Tools")}</Link></li>
            <li>/</li>
            <li className="text-[#39FF14]">VPD-{t("Rechner", "Calculator")}</li>
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
                <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-[#39FF14]" />
                VPD-{t("Rechner", "Calculator")}
              </h1>
              <p className="text-[10px] sm:text-sm text-muted-foreground">
                {t("Vapor Pressure Deficit — der Sweet Spot", "Vapor Pressure Deficit — the sweet spot")}
              </p>
            </div>
          </div>
        </motion.header>

        {/* ======================================
            COMPACT: Phase + Inputs + Results
            ALL ABOVE THE FOLD ON MOBILE
            ====================================== */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-xl p-3 sm:p-4 space-y-3"
        >
          {/* --- Phase Buttons (compact) --- */}
          <div>
            <div className="flex flex-wrap gap-1">
              {PHASES.map((p) => {
                const Icon = p.icon;
                const active = phase === p.key;
                return (
                  <button
                    key={p.key}
                    onClick={() => setPhase(p.key)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium border transition-all leading-none ${
                      active
                        ? PHASE_BTN[p.color]
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon size={12} />
                    {t(p.labelDe, p.labelEn)}
                  </button>
                );
              })}
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">
              {phase === "vegetative"
                ? t(`${range.low}-${range.high} kPa — niedriger VPD, hohe LF`, `${range.low}-${range.high} kPa — lower VPD, high humidity`)
                : phase === "flowering"
                ? t(`${range.low}-${range.high} kPa — mittlerer VPD, moderate LF`, `${range.low}-${range.high} kPa — medium VPD, moderate humidity`)
                : t(`${range.low}-${range.high} kPa — hoher VPD, niedrige LF, Trichome`, `${range.low}-${range.high} kPa — high VPD, low humidity, trichomes`)}
            </p>
          </div>

          {/* --- Temperature Slider --- */}
          <RangeSlider
            label={t("Temperatur", "Temperature")}
            value={temp}
            min={15}
            max={35}
            step={0.5}
            unit="°C"
            icon={Thermometer}
            onChange={setTemp}
            optMin={phaseCfg.tempMin}
            optMax={phaseCfg.tempMax}
            optLabel={
              temp >= phaseCfg.tempMin && temp <= phaseCfg.tempMax
                ? t("OK", "OK")
                : t("Anpassen", "Adjust")
            }
            vpdZone={vpdZone}
          />

          {/* --- Humidity Slider --- */}
          <RangeSlider
            label={t("Luftfeuchtigkeit", "Humidity")}
            value={rh}
            min={10}
            max={100}
            step={1}
            unit="%"
            icon={Droplets}
            onChange={setRh}
            optMin={phaseCfg.rhMin}
            optMax={phaseCfg.rhMax}
            optLabel={
              rh >= phaseCfg.rhMin && rh <= phaseCfg.rhMax
                ? t("OK", "OK")
                : t("Anpassen", "Adjust")
            }
            vpdZone={vpdZone}
          />

          {/* --- Leaf VPD Toggle (compact) --- */}
          <div className="pt-1">
            <button
              onClick={() => setShowLeafVpd(!showLeafVpd)}
              className="flex items-center gap-1 text-[10px] text-[#39FF14] hover:underline"
            >
              <Info size={10} />
              {showLeafVpd ? t("Blatt-VPD ausblenden", "Hide Leaf VPD") : t("Blatt-VPD anzeigen", "Show Leaf VPD")}
            </button>
            <AnimatePresence>
              {showLeafVpd && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2">
                    <RangeSlider
                      label={t("Blatt-Temp-Offset", "Leaf Temp Offset")}
                      value={leafTempOffset}
                      min={-5}
                      max={5}
                      step={0.5}
                      unit="°C"
                      icon={Leaf}
                      onChange={setLeafTempOffset}
                      optMin={-3}
                      optMax={-1}
                      optLabel={
                        leafTempOffset >= -3 && leafTempOffset <= -1
                          ? t("Typisch", "Typical")
                          : t("Ungew.", "Unusual")
                      }
                    />
                    <p className="text-[9px] text-muted-foreground mt-1">
                      {t("Blatt-Temp", "Leaf temp")}: {(temp + leafTempOffset).toFixed(1)}°C
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- Air VPD Result Card (compact, prominent) --- */}
          <div className="bg-black/30 border border-[#39FF14]/30 rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Droplets size={12} className="text-[#39FF14]" />
                <span className="text-xs text-muted-foreground">{t("Luft-VPD", "Air VPD")}</span>
              </div>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${zoneColor(vpdZone)}20`, color: zoneColor(vpdZone) }}
              >
                {zoneLabel(vpdZone, t)}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold font-mono" style={{ color: zoneColor(vpdZone) }}>
                {airVpd.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">kPa</span>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {range.low}-{range.high} {t("Ziel", "Target")}
              </span>
            </div>
            {/* Compact Color Bar */}
            <div className="mt-2">
              <VpdBar value={airVpd} phaseKey={phase} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
              {zoneAdvice(vpdZone, range, t)}
            </p>
          </div>

          {/* --- Leaf VPD Result (if shown) --- */}
          <AnimatePresence>
            {showLeafVpd && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-black/20 border border-border rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Leaf size={12} className="text-[#39FF14]" />
                      <span className="text-xs text-muted-foreground">{t("Blatt-VPD", "Leaf VPD")}</span>
                    </div>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${zoneColor(leafVpd < range.low ? "low" : leafVpd > range.high ? "high" : "optimal")}20`,
                        color: zoneColor(leafVpd < range.low ? "low" : leafVpd > range.high ? "high" : "optimal"),
                      }}
                    >
                      {zoneLabel(
                        leafVpd < range.low ? "low" : leafVpd > range.high ? "high" : "optimal",
                        t
                      )}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-[#39FF14]">{leafVpd.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">kPa</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ======================================
            PRO TIP (still above fold on most phones)
            ====================================== */}
        <motion.aside
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-3 sm:mt-6 bg-gradient-to-br from-[#39FF14]/10 to-[#39FF14]/5 border border-[#39FF14]/30 rounded-xl p-3 sm:p-4"
        >
          <h2 className="text-xs font-bold text-[#39FF14] mb-2 flex items-center gap-1.5">
            <Sparkles size={14} />
            {t("Pro Tip", "Pro Tip")}
          </h2>
          <div className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">
                {t("VPD ist nicht in Stein gemeißelt.", "VPD is not set in stone.")}
              </strong>{" "}
              {t(
                "Einige Sorten lieben höhere Werte, andere niedrigere. Beobachte deine Pflanzen als Gesamtbild — der VPD ist ein Leitwert.",
                "Some strains love higher values, others lower. Always observe your plants as a whole — VPD is a guideline."
              )}
            </p>
            <p>
              <strong className="text-[#39FF14]">{t("Blattspannung:", "Leaf tension:")}</strong>{" "}
              {t(
                "Gesunde Blätter stehen ~90° zum Stiel oder etwas höher.",
                "Healthy leaves stand ~90° to the stem or slightly higher."
              )}
            </p>
            <p>
              <strong className="text-blue-400">{t("Zu niedrig:", "Too low:")}</strong>{" "}
              {t("Blätter hängen schlaff — Pflanze kann nicht genug Wasser aufnehmen.", "Leaves hang limp — plant cannot absorb enough water.")}
            </p>
            <p>
              <strong className="text-yellow-400">{t("Zu hoch:", "Too high:")}</strong>{" "}
              {t(
                "Blätter stehen steil nach oben — Übertranspiration. In der Spätblüte (1.4-2.0 kPa) fördert hoher VPD Trichombildung. Bis 1.6 kPa gefahrlos!",
                "Leaves stand steeply upward — over-transpiration. In late flowering (1.4-2.0 kPa) high VPD boosts trichomes. Up to 1.6 kPa safe!"
              )}
            </p>
          </div>
        </motion.aside>

        {/* ======================================
            FAQ (below fold)
            ====================================== */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 sm:mt-6 bg-card border border-border rounded-xl p-3 sm:p-4"
        >
          <h2 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
            <HelpCircle size={14} className="text-[#39FF14]" />
            {t("Häufige Fragen", "FAQ")}
          </h2>
          <dl className="space-y-3" itemScope itemType="https://schema.org/FAQPage">
            {faqItems.map((faq, i) => (
              <div
                key={i}
                className="border-b border-border last:border-0 pb-3 last:pb-0"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <dt className="text-xs font-medium text-foreground mb-1" itemProp="name">
                  {faq.q}
                </dt>
                <dd
                  className="text-[11px] text-muted-foreground leading-relaxed"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <span itemProp="text">{faq.a}</span>
                </dd>
              </div>
            ))}
          </dl>
        </motion.section>

        {/* ======================================
            Info Box
            ====================================== */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-3 sm:mt-6 bg-card border border-border rounded-xl p-3 sm:p-4"
        >
          <h2 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
            <Info size={14} className="text-[#39FF14]" />
            {t("Was ist VPD?", "What is VPD?")}
          </h2>
          <div className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">VPD</strong>{" "}
              {t(
                "beschreibt den Druckunterschied zwischen maximal möglicher und tatsächlicher Feuchtigkeit in der Luft.",
                "describes the pressure difference between maximum possible and actual moisture in the air."
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-2">
                <span className="text-[10px] text-green-400 font-bold">{t("Vegetativ", "Vegetative")}</span>
                <p className="text-xs font-mono">0.4–1.0 kPa</p>
                <p className="text-[9px] text-muted-foreground">{t("Hohe LF (60-80%), niedriger VPD", "High RH (60-80%), low VPD")}</p>
              </div>
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-2">
                <span className="text-[10px] text-yellow-400 font-bold">{t("Blüte", "Flowering")}</span>
                <p className="text-xs font-mono">1.0–1.6 kPa</p>
                <p className="text-[9px] text-muted-foreground">{t("Mittlere LF (40-60%)", "Medium RH (40-60%)")}</p>
              </div>
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-2">
                <span className="text-[10px] text-purple-400 font-bold">{t("Spätblüte", "Late Flowering")}</span>
                <p className="text-xs font-mono">1.4–2.0 kPa</p>
                <p className="text-[9px] text-muted-foreground">{t("Niedrige LF (30-50%), Trichome", "Low RH (30-50%), trichomes")}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ======================================
            Footer CTA
            ====================================== */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 sm:mt-6 text-center py-4 border border-dashed border-[#39FF14]/30 rounded-xl bg-[#39FF14]/5"
        >
          <p className="text-sm text-foreground font-medium mb-1">
            {t("Mehr Tools für deinen Grow?", "More tools for your grow?")}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {t("Lux-Rechner, Stromkosten-Rechner & mehr.", "Lux calculator, power cost calculator & more.")}
          </p>
          <Link to="/tools">
            <Button variant="outline" size="sm">{t("Alle Tools", "All Tools")}</Button>
          </Link>
        </motion.section>
      </main>
    </>
  );
}
