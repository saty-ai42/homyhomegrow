import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowLeft, Zap, Plus, Trash2, Clock, Sun, Moon, Leaf, Wind, Droplets, Thermometer, Lightbulb, Fan, Timer, Waves, Sparkles, LightbulbOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/stores/i18nStore";

/* ============================================
   DEVICE TEMPLATES
   ============================================ */
const DEVICE_TEMPLATES = [
  { nameDe: "Lampe (LED)", nameEn: "Light (LED)", icon: Lightbulb, watt: 300, vpdHours: 18, bluteHours: 12 },
  { nameDe: "Lampe (HPS)", nameEn: "Light (HPS)", icon: Lightbulb, watt: 600, vpdHours: 18, bluteHours: 12 },
  { nameDe: "Lufter", nameEn: "Exhaust Fan", icon: Wind, watt: 20, vpdHours: 24, bluteHours: 24 },
  { nameDe: "Ventilator", nameEn: "Fan", icon: Fan, watt: 40, vpdHours: 24, bluteHours: 24 },
  { nameDe: "Luftbefeuchter", nameEn: "Humidifier", icon: Droplets, watt: 25, vpdHours: 12, bluteHours: 8 },
  { nameDe: "Luftentfeuchter", nameEn: "Dehumidifier", icon: Thermometer, watt: 200, vpdHours: 8, bluteHours: 12 },
  { nameDe: "Umluft", nameEn: "Circulation", icon: Wind, watt: 15, vpdHours: 24, bluteHours: 24 },
  { nameDe: "Pumpe", nameEn: "Pump", icon: Waves, watt: 15, vpdHours: 24, bluteHours: 24 },
  { nameDe: "Heizung", nameEn: "Heater", icon: Sun, watt: 500, vpdHours: 12, bluteHours: 8 },
  { nameDe: "Klimaanlage", nameEn: "AC", icon: Thermometer, watt: 800, vpdHours: 8, bluteHours: 10 },
  { nameDe: "Timer/Steuerung", nameEn: "Timer", icon: Timer, watt: 2, vpdHours: 24, bluteHours: 24 },
  { nameDe: "CO2 Generator", nameEn: "CO2 Generator", icon: Sparkles, watt: 100, vpdHours: 12, bluteHours: 12 },
  { nameDe: "Oszillierend", nameEn: "Oscillating Fan", icon: Fan, watt: 30, vpdHours: 24, bluteHours: 24 },
  { nameDe: "Abluft", nameEn: "Extractor", icon: Wind, watt: 50, vpdHours: 24, bluteHours: 24 },
  { nameDe: "Trockner", nameEn: "Dryer", icon: LightbulbOff, watt: 200, vpdHours: 0, bluteHours: 0 },
];

/* ============================================
   DEVICE TYPE
   ============================================ */
interface Device {
  id: number;
  name: string;
  watt: number;
  vpdHours: number;
  bluteHours: number;
}

/* ============================================
   STROMRECHNER PAGE
   ============================================ */
export default function StromRechner() {
  const t = useT();
  const [vpdTage, setVpdTage] = useState(28);
  const [bluteTage, setBluteTage] = useState(63);
  const [stromPreis, setStromPreis] = useState(0.35);
  const [nextId, setNextId] = useState(1);
  const [devices, setDevices] = useState<Device[]>([
    { id: 0, name: "LED Lampe", watt: 300, vpdHours: 18, bluteHours: 12 },
    { id: 1, name: "Lufter", watt: 20, vpdHours: 24, bluteHours: 24 },
    { id: 2, name: "Ventilator", watt: 40, vpdHours: 24, bluteHours: 24 },
  ]);

  // Add device
  function addDevice(templateIdx: number) {
    const tpl = DEVICE_TEMPLATES[templateIdx];
    if (!tpl) return;
    setDevices(prev => [...prev, {
      id: nextId,
      name: t(tpl.nameDe, tpl.nameEn),
      watt: tpl.watt,
      vpdHours: tpl.vpdHours,
      bluteHours: tpl.bluteHours,
    }]);
    setNextId(prev => prev + 1);
  }

  // Add custom device
  function addCustom() {
    setDevices(prev => [...prev, {
      id: nextId,
      name: t("Neues Gerat", "New Device"),
      watt: 10,
      vpdHours: 24,
      bluteHours: 24,
    }]);
    setNextId(prev => prev + 1);
  }

  // Remove device
  function removeDevice(id: number) {
    setDevices(prev => prev.filter(d => d.id !== id));
  }

  // Update device
  function updateDevice(id: number, field: keyof Device, value: string | number) {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  }

  // Calculate costs
  const costs = useMemo(() => {
    let vpdTotal = 0;
    let bluteTotal = 0;
    for (const d of devices) {
      vpdTotal += (d.watt * d.vpdHours * vpdTage) / 1000;
      bluteTotal += (d.watt * d.bluteHours * bluteTage) / 1000;
    }
    const vpdCost = vpdTotal * stromPreis;
    const bluteCost = bluteTotal * stromPreis;
    const gesamtKwh = vpdTotal + bluteTotal;
    const gesamtCost = vpdCost + bluteCost;
    return { vpdKwh: vpdTotal, bluteKwh: bluteTotal, vpdCost, bluteCost, gesamtKwh, gesamtCost };
  }, [devices, vpdTage, bluteTage, stromPreis]);

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-4">
        <ol className="flex items-center gap-1.5">
          <li><Link to="/" className="hover:text-[#39FF14]">{t("Home", "Home")}</Link></li>
          <li>/</li>
          <li><Link to="/tools" className="hover:text-[#39FF14]">{t("Tools", "Tools")}</Link></li>
          <li>/</li>
          <li className="text-[#39FF14]">{t("Stromkosten", "Power Cost")}</li>
        </ol>
      </nav>

      {/* Header */}
      <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/tools"><Button variant="outline" size="sm"><ArrowLeft size={16} /></Button></Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading flex items-center gap-2">
              <Zap className="w-7 h-7 text-[#39FF14]" />
              {t("Stromkosten-Rechner", "Power Cost Calculator")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("Berechne die Stromkosten deines kompletten Grows", "Calculate the power costs of your entire grow")}
            </p>
          </div>
        </div>
      </motion.header>

      {/* Settings: Phases + Price */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-5 mb-6">
        <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Clock size={16} className="text-[#39FF14]" />
          {t("Grow-Einstellungen", "Grow Settings")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">{t("Vegi Tage", "Veg Days")} <Leaf size={12} className="inline text-green-400" /></label>
            <Input type="number" min={1} max={60} value={vpdTage} onChange={e => setVpdTage(Math.max(1, Number(e.target.value)))} />
            <span className="text-[10px] text-muted-foreground">{t("Standard: 28 Tage", "Default: 28 days")}</span>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">{t("Blute Tage", "Flower Days")} <Moon size={12} className="inline text-rose-400" /></label>
            <Input type="number" min={1} max={120} value={bluteTage} onChange={e => setBluteTage(Math.max(1, Number(e.target.value)))} />
            <span className="text-[10px] text-muted-foreground">{t("Standard: 63 Tage (9 Wochen)", "Default: 63 days (9 weeks)")}</span>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">{t("Strompreis", "Electricity Rate")} (EUR/kWh)</label>
            <Input type="number" min={0.05} max={1} step={0.01} value={stromPreis} onChange={e => setStromPreis(Math.max(0.01, Number(e.target.value)))} />
            <span className="text-[10px] text-muted-foreground">{t("Standard: 0.35 EUR", "Default: 0.35 EUR")}</span>
          </div>
        </div>
      </motion.section>

      {/* Device Templates */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
        <h2 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Plus size={16} className="text-[#39FF14]" />
          {t("Gerat hinzufugen", "Add Device")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {DEVICE_TEMPLATES.map((tpl, i) => {
            const Icon = tpl.icon;
            return (
              <button key={i} onClick={() => addDevice(i)} disabled={devices.length >= 20}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-card border border-border hover:border-[#39FF14]/50 hover:text-[#39FF14] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                <Icon size={14} />{t(tpl.nameDe, tpl.nameEn)}
              </button>
            );
          })}
          <button onClick={addCustom} disabled={devices.length >= 20}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] hover:bg-[#39FF14]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <Plus size={14} />{t("Eigenes", "Custom")}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">{devices.length}/20 {t("Gerate", "devices")}</p>
      </motion.section>

      {/* Device List */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3 mb-8">
        {devices.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
            className="bg-card border border-border rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-muted-foreground mb-1">{t("Name", "Name")}</label>
                <Input value={d.name} onChange={e => updateDevice(d.id, "name", e.target.value)} className="text-sm" />
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">{t("Watt", "Watt")}</label>
                <Input type="number" min={1} value={d.watt} onChange={e => updateDevice(d.id, "watt", Math.max(1, Number(e.target.value)))} className="text-sm" />
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">{t("Vegi h/Tag", "Veg h/day")}</label>
                <Input type="number" min={0} max={24} value={d.vpdHours} onChange={e => updateDevice(d.id, "vpdHours", Math.min(24, Math.max(0, Number(e.target.value))))} className="text-sm" />
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">{t("Blute h/Tag", "Flower h/day")}</label>
                <Input type="number" min={0} max={24} value={d.bluteHours} onChange={e => updateDevice(d.id, "bluteHours", Math.min(24, Math.max(0, Number(e.target.value))))} className="text-sm" />
              </div>
              <div className="flex items-center gap-2 pb-0.5">
                <Button variant="ghost" size="sm" onClick={() => removeDevice(d.id)} className="text-[#FF4444] hover:text-[#FF4444]">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Results */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-[#39FF14]/10 to-[#39FF14]/5 border border-[#39FF14]/30 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[#39FF14] flex items-center gap-2">
          <Zap size={20} />
          {t("Kostenubersicht", "Cost Overview")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Vegi */}
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Leaf size={14} className="text-green-400" />
              <span className="text-xs text-muted-foreground">{t("Vegi Phase", "Veg Phase")}</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{costs.vpdKwh.toFixed(1)} <span className="text-xs">kWh</span></p>
            <p className="text-sm text-muted-foreground">{costs.vpdCost.toFixed(2)} EUR</p>
          </div>

          {/* Blute */}
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Moon size={14} className="text-rose-400" />
              <span className="text-xs text-muted-foreground">{t("Blute Phase", "Flower Phase")}</span>
            </div>
            <p className="text-2xl font-bold text-rose-400">{costs.bluteKwh.toFixed(1)} <span className="text-xs">kWh</span></p>
            <p className="text-sm text-muted-foreground">{costs.bluteCost.toFixed(2)} EUR</p>
          </div>

          {/* Gesamt */}
          <div className="bg-black/20 rounded-lg p-4 text-center border border-[#39FF14]/30">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Zap size={14} className="text-[#39FF14]" />
              <span className="text-xs text-muted-foreground">{t("Gesamt", "Total")}</span>
            </div>
            <p className="text-2xl font-bold text-[#39FF14]">{costs.gesamtKwh.toFixed(1)} <span className="text-xs">kWh</span></p>
            <p className="text-lg font-bold text-[#39FF14]">{costs.gesamtCost.toFixed(2)} EUR</p>
          </div>
        </div>

        {/* Per month breakdown */}
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            {t("Gesamtdauer", "Total duration")}: {vpdTage + bluteTage} {t("Tage", "days")} ({Math.round((vpdTage + bluteTage) / 7)} {t("Wochen", "weeks")})
          </p>
          <p className="text-xs text-muted-foreground">
            {t("Durchschnitt pro Monat", "Average per month")}: {(costs.gesamtCost / ((vpdTage + bluteTage) / 30.44)).toFixed(2)} EUR/{t("Monat", "month")}
          </p>
        </div>
      </motion.section>
    </main>
  );
}
