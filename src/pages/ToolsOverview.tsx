import { motion } from "framer-motion";
import { Link } from "react-router";
import { Wrench, Droplets, ArrowRight, Zap, Sun } from "lucide-react";

const tools = [
  {
    path: "/tools/vpd-calculator",
    icon: Droplets,
    titleDe: "VPD-Rechner",
    titleEn: "VPD Calculator",
    descDe: "Berechne den Vapor Pressure Deficit fur optimales Pflanzenwachstum. Luft-VPD und Blatt-VPD mit visuellem Farbbalken.",
    descEn: "Calculate Vapor Pressure Deficit for optimal plant growth. Air VPD and Leaf VPD with visual color bar.",
    badge: "NEU",
  },
  {
    path: "/tools/stromrechner",
    icon: Zap,
    titleDe: "Stromkosten-Rechner",
    titleEn: "Power Cost Calculator",
    descDe: "Berechne die Stromkosten deines kompletten Grows. Beliebig viele Gerate, Vegi/Blute-Phasen, Strompreis.",
    descEn: "Calculate power costs for your entire grow. Unlimited devices, veg/flower phases, electricity rate.",
    badge: "NEU",
  },
  {
    path: "/tools/lux-ppfd-dli",
    icon: Sun,
    titleDe: "Lux → PPFD → DLI",
    titleEn: "Lux → PPFD → DLI",
    descDe: "Wandle Lux in PPFD und DLI um. Optimal fur alle die nur ein Lux-Meter oder Handy haben.",
    descEn: "Convert Lux to PPFD and DLI. Perfect for anyone with just a lux meter or smartphone.",
    badge: "NEU",
  },
];

export default function ToolsOverview() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-3">
          <Wrench className="w-8 h-8 text-[#39FF14]" />
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-heading">Tools</h1>
        </div>
        <p className="text-muted-foreground max-w-xl">
          Nutzliche Tools fur deinen Cannabis-Anbau. Berechne Werte, optimiere dein Setup und hole das Maximum aus deinen Pflanzen heraus.
        </p>
      </motion.div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Link
                to={tool.path}
                className="group block bg-card border border-border rounded-xl p-6 hover:border-[#39FF14]/50 transition-all hover:shadow-lg hover:shadow-[#39FF14]/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#39FF14]/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#39FF14]" />
                  </div>
                  {tool.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#39FF14] text-[#0A0A0A] uppercase tracking-wider">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-[#39FF14] transition-colors">
                  {tool.titleDe}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {tool.descDe}
                </p>
                <div className="flex items-center gap-1 text-sm text-[#39FF14] font-medium">
                  <span>Offnen</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Coming Soon Placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center py-12 border border-dashed border-border rounded-xl"
      >
        <Wrench className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Weitere Tools folgen bald. Hast du Ideen? Schreib uns!
        </p>
      </motion.div>
    </div>
  );
}
