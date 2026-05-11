import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Sprout, ArrowLeft, Calendar, Loader2,
  Droplets, Thermometer, Beaker, Save, X, Search, Filter,
  Wind, Leaf, Flower2, PackageOpen, Tag, SunDim, Moon,
  AlertTriangle, Database, FlaskConical, Gauge,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useT } from "@/stores/i18nStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type View = "list" | "editGrow" | "timeline" | "editEntry";

function fadeUp(i: number) {
  return { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } } };
}

/* ============================================
   BADGES
   ============================================ */
function MethodBadge({ method }: { method: string }) {
  const c: Record<string, { icon: any; label: string; color: string }> = {
    soil: { icon: Leaf, label: "Erde", color: "bg-amber-500/10 text-amber-600" },
    coco: { icon: Leaf, label: "Coco", color: "bg-orange-500/10 text-orange-600" },
    hydro: { icon: Droplets, label: "Hydro", color: "bg-blue-500/10 text-blue-600" },
    aeroponic: { icon: Wind, label: "Aero", color: "bg-cyan-500/10 text-cyan-600" },
  };
  const cfg = c[method] || { icon: Sprout, label: method, color: "bg-muted text-muted-foreground" };
  const Icon = cfg.icon;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}><Icon size={12} />{cfg.label}</span>;
}

function SeedBadge({ seedType }: { seedType: string }) {
  const c: Record<string, string> = {
    feminized: "bg-pink-500/10 text-pink-600",
    regular: "bg-green-500/10 text-green-600",
    autoflowering: "bg-purple-500/10 text-purple-600",
    clone: "bg-teal-500/10 text-teal-600",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c[seedType] || "bg-muted text-muted-foreground"}`}>{seedType}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const c: Record<string, { icon: any; label: string; color: string }> = {
    germination: { icon: PackageOpen, label: "Keimung", color: "bg-yellow-500/10 text-yellow-600" },
    vegetative: { icon: Leaf, label: "Wachstum", color: "bg-green-500/10 text-green-600" },
    flowering: { icon: Flower2, label: "Blute", color: "bg-rose-500/10 text-rose-600" },
    harvesting: { icon: SunDim, label: "Ernte", color: "bg-orange-500/10 text-orange-600" },
    curing: { icon: Wind, label: "Curing", color: "bg-amber-500/10 text-amber-600" },
    completed: { icon: Tag, label: "Fertig", color: "bg-gray-500/10 text-gray-500" },
  };
  const cfg = c[status] || { icon: Sprout, label: status, color: "bg-muted text-muted-foreground" };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}><cfg.icon size={12} />{cfg.label}</span>;
}

function PhaseBadge({ phase }: { phase: string }) {
  if (phase === "flowering") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-500"><Moon size={12} />Blute</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-600"><SunDim size={12} />Vegi</span>;
}

function PhaseToggle({ value, onChange }: { value: "vegetative" | "flowering"; onChange: (v: "vegetative" | "flowering") => void }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange("vegetative")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${value === "vegetative" ? "bg-green-500/15 text-green-600 border border-green-500/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}><SunDim size={16} /> Vegi</button>
      <button type="button" onClick={() => onChange("flowering")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${value === "flowering" ? "bg-rose-500/15 text-rose-500 border border-rose-500/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}><Moon size={16} /> Blute</button>
    </div>
  );
}

function QueryError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#FF4444]/30 rounded-lg bg-[#FF4444]/5">
      <AlertTriangle size={40} className="text-[#FF4444] mb-3" />
      <p className="text-sm text-[#FF4444] font-medium mb-1">Fehler beim Laden</p>
      <p className="text-xs text-muted-foreground mb-4 max-w-sm">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Erneut versuchen</Button>}
    </div>
  );
}

/* ============================================
   ADMIN DIARIES
   ============================================ */
export default function AdminDiaries() {
  const [view, setView] = useState<View>("list");
  const [selectedGrowId, setSelectedGrowId] = useState<number | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [editGrowId, setEditGrowId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // ---- Grow form ----
  const [strainNameDe, setStrainNameDe] = useState("");
  const [strainNameEn, setStrainNameEn] = useState("");
  const [breeder, setBreeder] = useState("");
  const [slug, setSlug] = useState("");
  const [seedType, setSeedType] = useState<"feminized" | "regular" | "autoflowering" | "clone">("feminized");
  const [growMethod, setGrowMethod] = useState<"soil" | "coco" | "hydro" | "aeroponic">("soil");
  const [mediumDetails, setMediumDetails] = useState("");
  const [fertilizerDe, setFertilizerDe] = useState("");
  const [fertilizerEn, setFertilizerEn] = useState("");
  const [status, setStatus] = useState<"germination" | "vegetative" | "flowering" | "harvesting" | "curing" | "completed">("germination");
  const [startDate, setStartDate] = useState("");
  const [descriptionDe, setDescriptionDe] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [isPublic, setIsPublic] = useState<"public" | "private">("public");

  // ---- Entry form ----
  const [entryDay, setEntryDay] = useState(1);
  const [entryPhase, setEntryPhase] = useState<"vegetative" | "flowering">("vegetative");
  const [entryTitle, setEntryTitle] = useState("");
  const [entryVpd, setEntryVpd] = useState("");
  const [entryTemp, setEntryTemp] = useState<number | undefined>(undefined);
  const [entryHumidity, setEntryHumidity] = useState<number | undefined>(undefined);
  const [entryFertilizer, setEntryFertilizer] = useState("");
  const [entryAdditives, setEntryAdditives] = useState("");
  const [entryNotes, setEntryNotes] = useState("");

  // ---- Data ----
  const diariesQuery = trpc.diary.listAll.useQuery(filterStatus ? { status: filterStatus } : undefined, { refetchOnWindowFocus: false, retry: 1 });
  const entriesQuery = trpc.growEntry.list.useQuery({ diaryId: selectedGrowId! }, { enabled: selectedGrowId !== null && view === "timeline", refetchOnWindowFocus: false, retry: 1 });
  const utils = trpc.useUtils();

  // ---- Mutations ----
  const createGrow = trpc.diary.create.useMutation({
    onSuccess: () => { toast.success("Grow erstellt!"); diariesQuery.refetch(); setView("list"); resetGrowForm(); },
    onError: (err: any) => toast.error(err.message),
  });
  const updateGrow = trpc.diary.update.useMutation({
    onSuccess: () => { toast.success("Grow aktualisiert!"); diariesQuery.refetch(); setView("list"); resetGrowForm(); },
    onError: (err: any) => toast.error(err.message),
  });
  const deleteGrow = trpc.diary.delete.useMutation({
    onSuccess: () => { toast.success("Geloscht!"); diariesQuery.refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  const createEntry = trpc.growEntry.create.useMutation({
    onSuccess: () => { toast.success("Eintrag erstellt!"); entriesQuery.refetch(); utils.growEntry.list.invalidate(); setView("timeline"); resetEntryForm(); },
    onError: (err: any) => toast.error(err.message),
  });
  const updateEntry = trpc.growEntry.update.useMutation({
    onSuccess: () => { toast.success("Eintrag aktualisiert!"); entriesQuery.refetch(); utils.growEntry.list.invalidate(); setView("timeline"); resetEntryForm(); },
    onError: (err: any) => toast.error(err.message),
  });
  const deleteEntry = trpc.growEntry.delete.useMutation({
    onSuccess: () => { toast.success("Eintrag geloscht!"); entriesQuery.refetch(); utils.growEntry.list.invalidate(); },
    onError: (err: any) => toast.error(err.message),
  });
  const setupTables = trpc.diary.setup.useMutation({
    onSuccess: () => { seedData.mutate(); },
    onError: (err: any) => toast.error(err.message),
  });
  const seedData = trpc.diary.seed.useMutation({
    onSuccess: () => { toast.success("Demo-Daten erstellt!"); diariesQuery.refetch(); },
    onError: (err: any) => toast.error(err.message),
  });

  // ---- Helpers ----
  function resetGrowForm() {
    setStrainNameDe(""); setStrainNameEn(""); setBreeder(""); setSlug("");
    setSeedType("feminized"); setGrowMethod("soil"); setMediumDetails("");
    setFertilizerDe(""); setFertilizerEn(""); setStatus("germination");
    setStartDate(""); setDescriptionDe(""); setDescriptionEn(""); setIsPublic("public");
    setEditGrowId(null);
  }
  function resetEntryForm() {
    setEntryDay(1); setEntryPhase("vegetative"); setEntryTitle("");
    setEntryVpd(""); setEntryTemp(undefined); setEntryHumidity(undefined);
    setEntryFertilizer(""); setEntryAdditives(""); setEntryNotes("");
    setSelectedEntryId(null);
  }
  function openNewGrow() { resetGrowForm(); setEditGrowId(null); setView("editGrow"); }
  function openEditGrow(diary: any) {
    setEditGrowId(diary.id);
    setStrainNameDe(diary.strainNameDe || ""); setStrainNameEn(diary.strainNameEn || "");
    setBreeder(diary.breeder || ""); setSlug(diary.slug || "");
    setSeedType(diary.seedType || "feminized"); setGrowMethod(diary.growMethod || "soil");
    setMediumDetails(diary.mediumDetails || ""); setFertilizerDe(diary.fertilizerDe || "");
    setFertilizerEn(diary.fertilizerEn || ""); setStatus(diary.status || "germination");
    setStartDate(diary.startDate ? new Date(diary.startDate).toISOString().split("T")[0] : "");
    setDescriptionDe(diary.descriptionDe || ""); setDescriptionEn(diary.descriptionEn || "");
    setIsPublic(diary.isPublic || "public"); setView("editGrow");
  }
  function openTimeline(diaryId: number) { setSelectedGrowId(diaryId); setView("timeline"); }
  function openNewEntry(diaryId: number) { setSelectedGrowId(diaryId); resetEntryForm(); setView("editEntry"); }
  function openEditEntry(entry: any) {
    setSelectedEntryId(entry.id); setSelectedGrowId(entry.diaryId);
    setEntryDay(entry.day); setEntryPhase(entry.phase || "vegetative");
    setEntryTitle(entry.titleDe); setEntryVpd(entry.vpd || "");
    setEntryTemp(entry.temperature || undefined); setEntryHumidity(entry.humidity || undefined);
    setEntryFertilizer(entry.fertilizer || ""); setEntryAdditives(entry.additives || "");
    setEntryNotes(entry.notes || ""); setView("editEntry");
  }
  function handleSaveGrow() {
    if (!strainNameDe.trim() || !slug.trim()) { toast.error("Strain (DE) und Slug sind Pflicht!"); return; }
    if (!strainNameEn.trim()) { toast.error("Strain (EN) ist Pflicht!"); return; }
    const payload = {
      slug: slug.trim(), strainNameDe: strainNameDe.trim(), strainNameEn: strainNameEn.trim(),
      breeder: breeder.trim() || undefined, seedType, growMethod,
      mediumDetails: mediumDetails.trim() || undefined,
      fertilizerDe: fertilizerDe.trim() || undefined,
      fertilizerEn: fertilizerEn.trim() || undefined,
      status, startDate: startDate || undefined,
      descriptionDe: descriptionDe.trim() || undefined,
      descriptionEn: descriptionEn.trim() || undefined, isPublic,
    };
    if (editGrowId) updateGrow.mutate({ id: editGrowId, ...payload });
    else createGrow.mutate(payload as any);
  }
  function handleSaveEntry() {
    if (!entryTitle.trim()) { toast.error("Titel ist Pflicht!"); return; }
    if (!selectedGrowId) return;
    const payload = {
      diaryId: selectedGrowId, day: entryDay, phase: entryPhase,
      titleDe: entryTitle.trim(), vpd: entryVpd || undefined,
      temperature: entryTemp, humidity: entryHumidity,
      fertilizer: entryFertilizer.trim() || undefined,
      additives: entryAdditives.trim() || undefined,
      notes: entryNotes.trim() || undefined,
    };
    if (selectedEntryId) updateEntry.mutate({ id: selectedEntryId, ...payload } as any);
    else createEntry.mutate(payload as any);
  }

  const allDiaries = diariesQuery.data?.diaries ?? [];
  const filteredDiaries = searchTerm ? allDiaries.filter((d: any) => d.strainNameDe?.toLowerCase().includes(searchTerm.toLowerCase()) || d.breeder?.toLowerCase().includes(searchTerm.toLowerCase()) || d.slug?.toLowerCase().includes(searchTerm.toLowerCase())) : allDiaries;
  const selectedGrow = allDiaries.find((d: any) => d.id === selectedGrowId);

  /* ============= EDIT GROW ============= */
  if (view === "editGrow") {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => { setView("list"); resetGrowForm(); }}><ArrowLeft size={16} /></Button>
          <h1 className="text-2xl font-bold text-foreground font-heading">{editGrowId ? "Grow bearbeiten" : "Neuer Grow"}</h1>
        </div>
        <div className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Sorte (DE) *</label><Input value={strainNameDe} onChange={(e) => setStrainNameDe(e.target.value)} placeholder="z.B. Northern Lights" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Sorte (EN) *</label><Input value={strainNameEn} onChange={(e) => setStrainNameEn(e.target.value)} placeholder="e.g. Northern Lights" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Slug *</label><Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="northern-lights" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Breeder</label><Input value={breeder} onChange={(e) => setBreeder(e.target.value)} placeholder="Sensi Seeds" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Start Datum</label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Samen Typ</label><select value={seedType} onChange={(e) => setSeedType(e.target.value as any)} className="w-full p-2 rounded-lg bg-card border border-border text-sm text-foreground"><option value="feminized">Feminisiert</option><option value="regular">Regular</option><option value="autoflowering">Autoflowering</option><option value="clone">Clone</option></select></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Medium Typ</label><select value={growMethod} onChange={(e) => setGrowMethod(e.target.value as any)} className="w-full p-2 rounded-lg bg-card border border-border text-sm text-foreground"><option value="soil">Erde</option><option value="coco">Coco</option><option value="hydro">Hydro</option><option value="aeroponic">Aeroponik</option></select></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Status</label><select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full p-2 rounded-lg bg-card border border-border text-sm text-foreground"><option value="germination">Keimung</option><option value="vegetative">Wachstum</option><option value="flowering">Blute</option><option value="harvesting">Ernte</option><option value="curing">Curing</option><option value="completed">Fertig</option></select></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Medium Details <span className="text-muted-foreground font-normal">(z.B. BioBizz Light Mix)</span></label><Input value={mediumDetails} onChange={(e) => setMediumDetails(e.target.value)} placeholder="Genaues Medium..." /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Dunger (DE)</label><Input value={fertilizerDe} onChange={(e) => setFertilizerDe(e.target.value)} placeholder="z.B. BioBizz A+B, CalMag" /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Dunger (EN)</label><Input value={fertilizerEn} onChange={(e) => setFertilizerEn(e.target.value)} placeholder="e.g. Canna A+B, CalMag" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground mb-1">Beschreibung (DE)</label><textarea value={descriptionDe} onChange={(e) => setDescriptionDe(e.target.value)} rows={3} className="w-full p-3 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:border-[#39FF14] resize-none" placeholder="Setup, Licht, Box, etc..." /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Beschreibung (EN)</label><textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={3} className="w-full p-3 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:border-[#39FF14] resize-none" placeholder="Setup, light, tent, etc..." /></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Sichtbarkeit</label><select value={isPublic} onChange={(e) => setIsPublic(e.target.value as any)} className="w-full p-2 rounded-lg bg-card border border-border text-sm text-foreground max-w-xs"><option value="public">Offentlich</option><option value="private">Privat</option></select></div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => { setView("list"); resetGrowForm(); }}><X size={16} className="mr-1.5" />Abbrechen</Button>
            <Button onClick={handleSaveGrow} disabled={createGrow.isPending || updateGrow.isPending} className="bg-[#39FF14] text-[#0A0A0A] hover:bg-[#39FF14]/90"><Save size={16} className="mr-1.5" />{(createGrow.isPending || updateGrow.isPending) ? "Speichern..." : "Speichern"}</Button>
          </div>
        </div>
      </div>
    );
  }

  /* ============= TIMELINE ============= */
  if (view === "timeline" && selectedGrow) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { setView("list"); setSelectedGrowId(null); }}><ArrowLeft size={16} /></Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-heading flex items-center gap-2 flex-wrap">
                <Sprout className="w-6 h-6 text-[#39FF14]" />{selectedGrow.strainNameDe}<StatusBadge status={selectedGrow.status} />
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MethodBadge method={selectedGrow.growMethod} />{selectedGrow.mediumDetails && <span className="text-xs">{selectedGrow.mediumDetails}</span>}<SeedBadge seedType={selectedGrow.seedType} />{selectedGrow.breeder && <span>&bull; {selectedGrow.breeder}</span>}
              </div>
            </div>
          </div>
          <Button onClick={() => openNewEntry(selectedGrow.id)} className="bg-[#39FF14] text-[#0A0A0A] hover:bg-[#39FF14]/90"><Plus size={16} className="mr-1.5" />Eintrag</Button>
        </div>

        {/* Grow Info Card */}
        <div className="bg-card border border-border rounded-lg p-4 mb-4 space-y-2">
          {selectedGrow.fertilizerDe && <p className="text-sm"><FlaskConical size={14} className="inline mr-1.5 text-[#39FF14]" /><strong>Dunger:</strong> {selectedGrow.fertilizerDe}</p>}
          {selectedGrow.descriptionDe && <p className="text-sm text-muted-foreground">{selectedGrow.descriptionDe}</p>}
        </div>

        {entriesQuery.isLoading ? <div className="flex items-center gap-2 text-muted-foreground"><Loader2 size={16} className="animate-spin" />Lade...</div>
        : entriesQuery.error ? <QueryError message={entriesQuery.error.message} onRetry={() => entriesQuery.refetch()} />
        : entriesQuery.data && entriesQuery.data.length > 0 ? (
          <AnimatePresence><div className="space-y-3">
            {entriesQuery.data.map((entry: any, i: number) => (
              <motion.div key={entry.id} custom={i} initial="hidden" animate="visible" variants={fadeUp(i)} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <PhaseBadge phase={entry.phase || "vegetative"} />
                      <span className="px-2 py-0.5 rounded bg-[#39FF14]/10 text-[#39FF14] text-xs font-bold whitespace-nowrap">Tag {entry.day}</span>
                      <h3 className="text-foreground font-bold">{entry.titleDe}</h3>
                    </div>
                    {/* Messwerte */}
                    <div className="flex flex-wrap gap-3 mb-3 text-xs">
                      {entry.vpd && <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-medium"><Gauge size={11} />VPD {entry.vpd}</span>}
                      {entry.temperature != null && <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 font-medium"><Thermometer size={11} />{entry.temperature}°C</span>}
                      {entry.humidity != null && <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-medium"><Droplets size={11} />{entry.humidity}%</span>}
                    </div>
                    {/* Dunger / Zusatze */}
                    {(entry.fertilizer || entry.additives) && (
                      <div className="flex flex-wrap gap-2 mb-2 text-xs">
                        {entry.fertilizer && <span className="flex items-center gap-1 text-muted-foreground"><Beaker size={11} className="text-[#39FF14]" />{entry.fertilizer}</span>}
                        {entry.additives && <span className="flex items-center gap-1 text-muted-foreground"><FlaskConical size={11} className="text-purple-400" />{entry.additives}</span>}
                      </div>
                    )}
                    {/* Sonstiges */}
                    {entry.notes && <p className="text-sm text-muted-foreground line-clamp-3">{entry.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEditEntry(entry)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Loschen?")) deleteEntry.mutate({ id: entry.id }); }} className="text-[#FF4444]"><Trash2 size={14} /></Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div></AnimatePresence>
        ) : (
          <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
            <Calendar size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">Noch keine Eintrage</p>
            <Button className="mt-4 bg-[#39FF14] text-[#0A0A0A] hover:bg-[#39FF14]/90" onClick={() => openNewEntry(selectedGrow.id)}><Plus size={16} className="mr-1.5" />Ersten Eintrag</Button>
          </div>
        )}
      </div>
    );
  }

  /* ============= EDIT ENTRY ============= */
  if (view === "editEntry" && selectedGrow) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => { setView("timeline"); resetEntryForm(); }}><ArrowLeft size={16} /></Button>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground font-heading">{selectedEntryId ? "Eintrag bearbeiten" : "Neuer Eintrag"}<span className="block sm:inline sm:ml-2 text-sm font-normal text-muted-foreground">{selectedGrow.strainNameDe}</span></h1>
        </div>
        <div className="space-y-4 max-w-2xl">
          {/* Phase + Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div><label className="block text-sm font-medium text-foreground mb-2">Phase</label><PhaseToggle value={entryPhase} onChange={setEntryPhase} /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Tag *</label><Input type="number" min={1} value={entryDay} onChange={(e) => setEntryDay(Math.max(1, Number(e.target.value)))} /></div>
          </div>
          {/* Titel */}
          <div><label className="block text-sm font-medium text-foreground mb-1">Titel *</label><Input value={entryTitle} onChange={(e) => setEntryTitle(e.target.value)} placeholder="z.B. Blute Woche 2 - Trichome sichtbar" /></div>
          {/* Messwerte: VPD, Temp, LF */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Messwerte</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label className="block text-xs text-muted-foreground mb-1">VPD (kPa)</label><Input value={entryVpd} onChange={(e) => setEntryVpd(e.target.value)} placeholder="1.2" /></div>
              <div><label className="block text-xs text-muted-foreground mb-1">Temperatur °C</label><Input type="number" value={entryTemp ?? ""} onChange={(e) => setEntryTemp(e.target.value ? Number(e.target.value) : undefined)} placeholder="24" /></div>
              <div><label className="block text-xs text-muted-foreground mb-1">Luftfeuchtie %</label><Input type="number" min={0} max={100} value={entryHumidity ?? ""} onChange={(e) => setEntryHumidity(e.target.value ? Number(e.target.value) : undefined)} placeholder="55" /></div>
            </div>
          </div>
          {/* Dunger + Zusatze */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Dunger & Zusatze</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="block text-xs text-muted-foreground mb-1">Dunger</label><Input value={entryFertilizer} onChange={(e) => setEntryFertilizer(e.target.value)} placeholder="z.B. 2ml/l A+B, 1ml/l CalMag" /></div>
              <div><label className="block text-xs text-muted-foreground mb-1">Zusatze</label><Input value={entryAdditives} onChange={(e) => setEntryAdditives(e.target.value)} placeholder="z.B. Root Juice, Silicium, Bud XL" /></div>
            </div>
          </div>
          {/* Sonstiges */}
          <div><label className="block text-sm font-medium text-foreground mb-1">Sonstiges / Notizen</label><textarea value={entryNotes} onChange={(e) => setEntryNotes(e.target.value)} rows={3} className="w-full p-3 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:border-[#39FF14] resize-none" placeholder="Was ist heute passiert? Beobachtungen, Probleme, etc..." /></div>
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => { setView("timeline"); resetEntryForm(); }}><X size={16} className="mr-1.5" />Abbrechen</Button>
            <Button onClick={handleSaveEntry} disabled={createEntry.isPending || updateEntry.isPending} className="bg-[#39FF14] text-[#0A0A0A] hover:bg-[#39FF14]/90"><Save size={16} className="mr-1.5" />{(createEntry.isPending || updateEntry.isPending) ? "Speichern..." : "Speichern"}</Button>
          </div>
        </div>
      </div>
    );
  }

  /* ============= LIST VIEW ============= */
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-foreground font-heading flex items-center gap-2"><Sprout className="w-6 h-6 text-[#39FF14]" />Grow Diaries<span className="text-sm font-normal text-muted-foreground">({filteredDiaries.length})</span></h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { if (confirm("ALLE Grows loschen und 2 Demo-Grows erstellen?")) setupTables.mutate(); }} disabled={setupTables.isPending || seedData.isPending}><Database size={14} className="mr-1.5" />{setupTables.isPending || seedData.isPending ? "..." : "Reset + Demo"}</Button>
          <Button onClick={openNewGrow} className="bg-[#39FF14] text-[#0A0A0A] hover:bg-[#39FF14]/90"><Plus size={16} className="mr-1.5" />Neuer Grow</Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Sorte suchen..." className="pl-9" /></div>
        <div className="flex items-center gap-2"><Filter size={16} className="text-muted-foreground" /><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-2 rounded-lg bg-card border border-border text-sm text-foreground"><option value="">Alle</option><option value="germination">Keimung</option><option value="vegetative">Wachstum</option><option value="flowering">Blute</option><option value="harvesting">Ernte</option><option value="curing">Curing</option><option value="completed">Fertig</option></select></div>
      </div>
      {diariesQuery.error && <QueryError message={diariesQuery.error.message} onRetry={() => diariesQuery.refetch()} />}
      {diariesQuery.isLoading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 size={16} className="animate-spin" />Lade...</div>}
      {!diariesQuery.isLoading && !diariesQuery.error && (
        <>
          {filteredDiaries.length > 0 ? (
            <div className="space-y-3">
              {filteredDiaries.map((diary: any, i: number) => (
                <motion.div key={diary.id} custom={i} initial="hidden" animate="visible" variants={fadeUp(i)} className="bg-card border border-border rounded-lg p-4 hover:border-[#39FF14]/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-foreground font-bold text-base">{diary.strainNameDe}</h3>
                        <StatusBadge status={diary.status} />
                        <MethodBadge method={diary.growMethod} />
                        <SeedBadge seedType={diary.seedType} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        {diary.mediumDetails && <span>{diary.mediumDetails}</span>}
                        {diary.breeder && <span>&bull; {diary.breeder}</span>}
                        {diary.startDate && <span className="flex items-center gap-1"><Calendar size={12} />{new Date(diary.startDate).toLocaleDateString("de-DE")}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => openEditGrow(diary)}><Pencil size={14} className="mr-1" />Bearbeiten</Button>
                      <Button size="sm" variant="outline" onClick={() => openTimeline(diary.id)}><Calendar size={14} className="mr-1" />Timeline</Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm("Loschen?")) deleteGrow.mutate({ id: diary.id }); }} className="text-[#FF4444]"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
              <Sprout size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">{searchTerm || filterStatus ? "Keine Grows" : "Noch keine Grows"}</p>
              {searchTerm || filterStatus ? <Button className="mt-4" variant="outline" onClick={() => { setSearchTerm(""); setFilterStatus(""); }}>Zurucksetzen</Button>
              : <Button className="mt-4 bg-[#39FF14] text-[#0A0A0A] hover:bg-[#39FF14]/90" onClick={openNewGrow}><Plus size={16} className="mr-1.5" />Ersten Grow</Button>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
