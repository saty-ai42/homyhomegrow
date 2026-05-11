import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus, Send, Save, Trash2, Eye, Loader2, Mail, ArrowLeft,
  Users, Download, Search, UserPlus, X, ChevronLeft, ChevronRight,
  CheckCircle2, Crop,
} from "lucide-react";
import ImageCropper from "@/components/ImageCropper";
import { trpc } from "@/providers/trpc";
import { useT } from "@/stores/i18nStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type View = "list" | "edit" | "subscribers";
type SubStatus = "all" | "confirmed" | "pending" | "unsubscribed";

const PAGE_SIZE = 25;

function fadeUp(i: number) {
  return {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } },
  };
}

/* ============================================
   IMAGE UPLOAD
   ============================================ */
function ImageUploadButton({ onImageUploaded }: { onImageUploaded: (url: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ name: string; type: string } | null>(null);
  const uploadMutation = trpc.newsletterImage.upload.useMutation({
    onSuccess: (data) => {
      onImageUploaded(data.url);
      toast.success("Bild hochgeladen!");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) { toast.error("Nur Bilder erlaubt"); return; }
      if (file.size > 10 * 1024 * 1024) { toast.error("Max. 10MB"); return; }
      setPendingFile({ name: file.name, type: file.type });
      const reader = new FileReader();
      reader.onload = () => setCropImage(reader.result as string);
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  const handleCrop = useCallback(
    (croppedBase64: string) => {
      setCropImage(null);
      uploadMutation.mutate({
        filename: pendingFile?.name || "image.jpg",
        mimeType: pendingFile?.type || "image/jpeg",
        base64: croppedBase64.split(",")[1],
      });
      setPendingFile(null);
    },
    [uploadMutation, pendingFile]
  );

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadMutation.isPending}
        title="Bild hochladen"
        className="px-2 py-1 text-xs rounded bg-[#39FF14]/10 text-[#39FF14] hover:bg-[#39FF14]/20 transition-colors border border-[#39FF14]/30 flex items-center gap-1"
      >
        {uploadMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Crop size={12} />}
        {uploadMutation.isPending ? "..." : "Bild"}
      </button>
      {cropImage && (
        <ImageCropper imageSrc={cropImage} aspectRatio={16 / 9} onCrop={handleCrop} onCancel={() => setCropImage(null)} />
      )}
    </>
  );
}

/* ============================================
   EDITOR TOOLBAR
   ============================================ */
function EditorToolbar({ onInsert }: { onInsert: (tag: string) => void }) {
  const buttons = [
    { label: "B", tag: "<strong>TEXT</strong>", title: "Fett" },
    { label: "H1", tag: "<h1>TEXT</h1>", title: "Überschrift 1" },
    { label: "H2", tag: "<h2>TEXT</h2>", title: "Überschrift 2" },
    { label: "P", tag: "<p>TEXT</p>", title: "Absatz" },
    { label: "IMG", tag: '<img src="URL" alt="TEXT" style="max-width:100%;border-radius:8px;" />', title: "Bild" },
    { label: "A", tag: '<a href="URL">TEXT</a>', title: "Link" },
    { label: "UL", tag: "<ul>\n  <li>Punkt 1</li>\n  <li>Punkt 2</li>\n</ul>", title: "Liste" },
    { label: "Quote", tag: "<blockquote>TEXT</blockquote>", title: "Zitat" },
  ];

  return (
    <div className="flex flex-wrap gap-1 mb-2 items-center">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          onClick={() => onInsert(btn.tag)}
          title={btn.title}
          className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors border border-border"
        >
          {btn.label}
        </button>
      ))}
      <ImageUploadButton onImageUploaded={(url) => onInsert(`<img src="${url}" alt="Newsletter Bild" style="max-width:100%;border-radius:8px;" />`)} />
    </div>
  );
}

/* ============================================
   STATUS BADGE
   ============================================ */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: "text-[#39FF14] bg-[#39FF14]/10",
    pending: "text-[#FFD600] bg-[#FFD600]/10",
    unsubscribed: "text-[#FF4444] bg-[#FF4444]/10",
    draft: "text-muted-foreground bg-muted",
    sending: "text-[#FFD600] bg-[#FFD600]/10",
    sent: "text-[#39FF14] bg-[#39FF14]/10",
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${colors[status] || colors.draft}`}>
      {status}
    </span>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */
export default function AdminNewsletter() {
  const t = useT();
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Subscribers state
  const [subStatus, setSubStatus] = useState<SubStatus>("all");
  const [subSearch, setSubSearch] = useState("");
  const [subPage, setSubPage] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");

  // Queries
  const campaignsQuery = trpc.newsletterCampaign.list.useQuery();
  const subscribersQuery = trpc.newsletter.list.useQuery(
    { status: subStatus, search: subSearch || undefined, limit: PAGE_SIZE, offset: subPage * PAGE_SIZE },
    { enabled: view === "subscribers" }
  );
  const statsQuery = trpc.newsletter.stats.useQuery();

  // Mutations
  const createMutation = trpc.newsletterCampaign.create.useMutation({
    onSuccess: () => { toast.success(t("Gespeichert!", "Saved!")); campaignsQuery.refetch(); setView("list"); resetForm(); },
  });
  const updateMutation = trpc.newsletterCampaign.update.useMutation({
    onSuccess: () => { toast.success(t("Aktualisiert!", "Updated!")); campaignsQuery.refetch(); },
  });
  const sendMutation = trpc.newsletterCampaign.send.useMutation({
    onSuccess: (data) => {
      toast.success(t(`Gesendet: ${data.sentCount}/${data.totalRecipients}`, `Sent: ${data.sentCount}/${data.totalRecipients}`));
      campaignsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.newsletterCampaign.delete.useMutation({
    onSuccess: () => { toast.success(t("Gelöscht!", "Deleted!")); campaignsQuery.refetch(); },
  });
  const deleteSubMutation = trpc.newsletter.deleteSubscriber.useMutation({
    onSuccess: () => { toast.success(t("Gelöscht!", "Deleted!")); subscribersQuery.refetch(); statsQuery.refetch(); },
  });
  const confirmSubMutation = trpc.newsletter.confirmSubscriber.useMutation({
    onSuccess: () => { toast.success(t("Bestätigt!", "Confirmed!")); subscribersQuery.refetch(); statsQuery.refetch(); },
  });
  const addSubMutation = trpc.newsletter.addSubscriber.useMutation({
    onSuccess: () => {
      toast.success(t("Abonnent hinzugefügt!", "Subscriber added!"));
      setNewEmail(""); setNewName(""); setShowAddForm(false);
      subscribersQuery.refetch(); statsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const resetForm = () => {
    setEditingId(null); setSubject(""); setContentHtml(""); setPreviewText(""); setShowPreview(false);
  };

  const handleEdit = (campaign: { id: number; subject: string | null; contentHtml: string | null; previewText: string | null }) => {
    setEditingId(campaign.id);
    setSubject(campaign.subject || "");
    setContentHtml(campaign.contentHtml || "");
    setPreviewText(campaign.previewText || "");
    setView("edit");
  };

  const handleSave = () => {
    if (!subject.trim() || !contentHtml.trim()) {
      toast.error(t("Betreff und Inhalt sind Pflicht!", "Subject and content required!"));
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, subject, contentHtml, previewText });
    } else {
      createMutation.mutate({ subject, contentHtml, previewText });
    }
  };

  const handleInsertTag = (tag: string) => {
    const textarea = document.getElementById("newsletter-html") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = contentHtml.substring(start, end);
    const replacement = tag.replace(/TEXT/g, selected || "TEXT").replace(/URL/g, selected || "https://homyhomegrow.de");
    setContentHtml(contentHtml.substring(0, start) + replacement + contentHtml.substring(end));
    setTimeout(() => { textarea.focus(); const c = start + replacement.length; textarea.setSelectionRange(c, c); }, 0);
  };

  /* ============================================
     SUBSCRIBERS VIEW
     ============================================ */
  if (view === "subscribers") {
    const totalPages = Math.ceil((subscribersQuery.data?.total || 0) / PAGE_SIZE);
    const tabs: { key: SubStatus; label: string; count?: number }[] = [
      { key: "all", label: t("Alle", "All"), count: statsQuery.data?.total },
      { key: "confirmed", label: t("Confirmed", "Confirmed"), count: statsQuery.data?.confirmed },
      { key: "pending", label: t("Pending", "Pending"), count: statsQuery.data?.pending },
      { key: "unsubscribed", label: t("Abgemeldet", "Unsubscribed"), count: statsQuery.data?.unsubscribed },
    ];

    const handleExport = () => {
      if (!subscribersQuery.data?.subscribers.length) return;
      const rows = [
        ["ID", "Email", "Name", "Status", "SubscribedAt", "ConfirmedAt", "UnsubscribedAt"],
        ...subscribersQuery.data.subscribers.map((s) => [
          String(s.id), s.email, s.name || "", s.status,
          s.subscribedAt ? new Date(s.subscribedAt).toISOString() : "",
          s.confirmedAt ? new Date(s.confirmedAt).toISOString() : "",
          s.unsubscribedAt ? new Date(s.unsubscribedAt).toISOString() : "",
        ]),
      ];
      const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `homyhomegrow-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      toast.success(t(`${rows.length - 1} Adressen exportiert`, `${rows.length - 1} addresses exported`));
    };

    return (
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setView("list")}><ArrowLeft size={16} /></Button>
            <h1 className="text-2xl font-bold text-foreground font-heading flex items-center gap-2">
              <Users className="w-6 h-6 text-[#39FF14]" />
              {t("Abonnenten", "Subscribers")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!subscribersQuery.data?.subscribers?.length}>
              <Download size={14} className="mr-1" />CSV
            </Button>
            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <UserPlus size={14} className="mr-1" />{t("Hinzufügen", "Add")}
            </Button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4 p-4 bg-card border border-border rounded-lg">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" className="flex-1" />
              <Input placeholder={t("Name (optional)", "Name (optional)")} value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1" />
              <Button
                onClick={() => { if (!newEmail.trim()) return; addSubMutation.mutate({ email: newEmail, name: newName || undefined }); }}
                disabled={addSubMutation.isPending}
                className="bg-[#39FF14] text-[#0A0A0A] hover:bg-[#39FF14]/90"
              >
                {addSubMutation.isPending ? "..." : t("Speichern", "Save")}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setSubStatus(tab.key); setSubPage(0); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${subStatus === tab.key ? "bg-[#39FF14] text-[#0A0A0A]" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label} {tab.count !== undefined && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("Email-Adresse suchen...", "Search email address...")}
            value={subSearch}
            onChange={(e) => { setSubSearch(e.target.value); setSubPage(0); }}
            className="pl-9"
          />
          {subSearch && (
            <button onClick={() => { setSubSearch(""); setSubPage(0); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Table */}
        {subscribersQuery.isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 size={16} className="animate-spin" />{t("Lade...", "Loading...")}</div>
        ) : subscribersQuery.data?.subscribers?.length ? (
          <>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 text-foreground font-bold w-10">#</th>
                    <th className="text-left p-3 text-foreground font-bold">{t("Email", "Email")}</th>
                    <th className="text-left p-3 text-foreground font-bold hidden md:table-cell">{t("Name", "Name")}</th>
                    <th className="text-left p-3 text-foreground font-bold">{t("Status", "Status")}</th>
                    <th className="text-left p-3 text-foreground font-bold hidden sm:table-cell">{t("Seit", "Since")}</th>
                    <th className="text-right p-3 text-foreground font-bold w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {subscribersQuery.data.subscribers.map((sub, i) => (
                    <tr key={sub.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="p-3 text-muted-foreground">{subPage * PAGE_SIZE + i + 1}</td>
                      <td className="p-3 text-foreground font-mono text-xs break-all">{sub.email}</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{sub.name || "—"}</td>
                      <td className="p-3"><StatusBadge status={sub.status} /></td>
                      <td className="p-3 text-muted-foreground text-xs hidden sm:table-cell">
                        {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString("de-DE") : "—"}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {sub.status === "pending" && (
                            <button
                              onClick={() => { if (confirm(t(`"${sub.email}" bestätigen?`, `Confirm "${sub.email}"?`))) confirmSubMutation.mutate({ id: sub.id }); }}
                              disabled={confirmSubMutation.isPending}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-[#39FF14] hover:bg-[#39FF14]/10 transition-colors"
                              title={t("Manuell bestätigen", "Confirm manually")}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => { if (confirm(t(`"${sub.email}" löschen?`, `Delete "${sub.email}"?`))) deleteSubMutation.mutate({ id: sub.id }); }}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-[#FF4444] hover:bg-[#FF4444]/10 transition-colors"
                            title={t("Löschen", "Delete")}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-muted-foreground">
                  {subPage * PAGE_SIZE + 1}-{Math.min((subPage + 1) * PAGE_SIZE, subscribersQuery.data.total)} {t("von", "of")} {subscribersQuery.data.total}
                </span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setSubPage((p) => Math.max(0, p - 1))} disabled={subPage === 0}><ChevronLeft size={14} /></Button>
                  <Button variant="outline" size="sm" onClick={() => setSubPage((p) => Math.min(totalPages - 1, p + 1))} disabled={subPage >= totalPages - 1}><ChevronRight size={14} /></Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">{t("Keine Abonnenten gefunden", "No subscribers found")}</p>
          </div>
        )}
      </div>
    );
  }

  /* ============================================
     EDIT VIEW
     ============================================ */
  if (view === "edit") {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => { setView("list"); resetForm(); }}><ArrowLeft size={16} /></Button>
          <h1 className="text-2xl font-bold text-foreground font-heading">
            {editingId ? t("Bearbeiten", "Edit") : t("Neuer Newsletter", "New Newsletter")}
          </h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("Betreff", "Subject")} *</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="z.B. Neue Grow Guides März 2026" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("Preview Text", "Preview Text")}</label>
            <Input value={previewText} onChange={(e) => setPreviewText(e.target.value)} placeholder="Kurzer Teaser für den Posteingang..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t("Inhalt (HTML)", "Content (HTML)")} *</label>
            <EditorToolbar onInsert={handleInsertTag} />
            <textarea
              id="newsletter-html"
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
              placeholder="<h1>Dein Newsletter</h1><p>HTML hier eingeben...</p>"
              className="w-full min-h-[300px] p-4 rounded-lg bg-card border border-border text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#39FF14] resize-y"
              spellCheck={false}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              <Eye size={14} className="mr-1.5" />{showPreview ? t("Vorschau aus", "Hide Preview") : t("Vorschau", "Preview")}
            </Button>
            <p className="text-xs text-muted-foreground">{t("Tip: Bilder hochladen mit 'Bild' Button in Toolbar", "Tip: Upload images with 'Bild' button in toolbar")}</p>
          </div>

          {showPreview && (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="bg-card px-4 py-2 text-xs font-bold text-muted-foreground border-b border-border">{t("Vorschau", "Preview")}</div>
              <div className="bg-[#0A0A0A] p-6">
                <div className="max-w-[480px] mx-auto bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden">
                  <div className="text-center py-6"><span className="text-[#39FF14] text-xl font-extrabold">HOMYHOME</span><span className="text-white text-xl font-extrabold">GROW</span></div>
                  <div className="px-6 pb-6 newsletter-preview" dangerouslySetInnerHTML={{ __html: contentHtml }} />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4">
            <Button variant="outline" onClick={() => { setView("list"); resetForm(); }}><ArrowLeft size={16} className="mr-1.5" />{t("Zurück", "Back")}</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              <Save size={16} className="mr-1.5" />{(createMutation.isPending || updateMutation.isPending) ? "..." : t("Speichern", "Save")}
            </Button>
            {editingId && (
              <Button onClick={() => sendMutation.mutate({ id: editingId })} disabled={sendMutation.isPending} className="bg-[#39FF14] text-[#0A0A0A] hover:bg-[#39FF14]/90">
                <Send size={16} className="mr-1.5" />{sendMutation.isPending ? t("Sende...", "Sending...") : t("An alle senden!", "Send to all!")}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ============================================
     LIST VIEW (Campaigns)
     ============================================ */
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground font-heading flex items-center gap-2">
          <Mail className="w-6 h-6 text-[#39FF14]" />
          {t("Newsletter", "Newsletter")}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setView("subscribers")}>
            <Users size={16} className="mr-1.5" />
            {t("Abonnenten", "Subscribers")}
            {statsQuery.data && (
              <Badge variant="secondary" className="ml-1.5 text-xs">{statsQuery.data.confirmed}</Badge>
            )}
          </Button>
          <Button onClick={() => { resetForm(); setView("edit"); }}>
            <Plus size={16} className="mr-1.5" />{t("Neu", "New")}
          </Button>
        </div>
      </div>

      {campaignsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 size={16} className="animate-spin" />{t("Lade...", "Loading...")}</div>
      ) : campaignsQuery.data?.length ? (
        <div className="space-y-3">
          {campaignsQuery.data.map((campaign, i) => (
            <motion.div key={campaign.id} custom={i} initial="hidden" animate="visible" variants={fadeUp(i)} className="bg-card border border-border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={campaign.status || "draft"} />
                    <span className="text-xs text-muted-foreground">{campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString("de-DE") : ""}</span>
                  </div>
                  <h3 className="text-foreground font-bold truncate">{campaign.subject}</h3>
                  {campaign.recipientCount ? (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {campaign.sentCount || 0} / {campaign.recipientCount} {t("gesendet", "sent")}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(campaign)}><Eye size={14} className="mr-1" />{campaign.status === "draft" ? t("Bearbeiten", "Edit") : t("Ansehen", "View")}</Button>
                  {campaign.status === "draft" && <Button size="sm" onClick={() => sendMutation.mutate({ id: campaign.id })} disabled={sendMutation.isPending} className="bg-[#39FF14] text-[#0A0A0A] hover:bg-[#39FF14]/90"><Send size={14} className="mr-1" />{sendMutation.isPending ? "..." : t("Senden", "Send")}</Button>}
                  <Button variant="outline" size="sm" onClick={() => { if (confirm(t("Löschen?", "Delete?"))) deleteMutation.mutate({ id: campaign.id }); }} className="text-[#FF4444] hover:text-[#FF4444] hover:bg-[#FF4444]/10"><Trash2 size={14} /></Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Mail size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">{t("Noch keine Newsletter", "No newsletters yet")}</p>
          <Button className="mt-4" onClick={() => { resetForm(); setView("edit"); }}><Plus size={16} className="mr-1.5" />{t("Erstellen", "Create")}</Button>
        </div>
      )}
    </div>
  );
}
