import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, FileText, Eye, EyeOff, Archive } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useT } from "@/stores/i18nStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import AdminHelpButton from "@/components/admin/AdminHelpButton";

export default function AdminBlog() {
  const t = useT();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ slug: "", titleDe: "", titleEn: "", excerptDe: "", excerptEn: "", contentDe: "", contentEn: "", featuredImage: "", status: "draft" as "draft" | "published" | "archived", readTimeMinutes: 5 });

  const utils = trpc.useUtils();
  const blogQuery = trpc.blog.list.useQuery({ status: undefined, search: search || undefined, limit: 50 });
  const createMutation = trpc.blog.create.useMutation({ onSuccess: () => { utils.blog.list.invalidate(); resetForm(); setDialogOpen(false); toast.success(t("Erstellt!", "Created!")); } });
  const updateMutation = trpc.blog.update.useMutation({ onSuccess: () => { utils.blog.list.invalidate(); resetForm(); setDialogOpen(false); toast.success(t("Aktualisiert!", "Updated!")); } });
  const deleteMutation = trpc.blog.delete.useMutation({ onSuccess: () => { utils.blog.list.invalidate(); toast.success(t("Gelöscht!", "Deleted!")); } });

  function resetForm() { setForm({ slug: "", titleDe: "", titleEn: "", excerptDe: "", excerptEn: "", contentDe: "", contentEn: "", featuredImage: "", status: "draft", readTimeMinutes: 5 }); setEditingId(null); }
  function startEdit(post: { id: number; slug: string; titleDe: string; titleEn: string; excerptDe: string | null; excerptEn: string | null; contentDe: string | null; contentEn: string | null; featuredImage: string | null; status: string; readTimeMinutes: number | null }) {
    setForm({ slug: post.slug, titleDe: post.titleDe, titleEn: post.titleEn, excerptDe: post.excerptDe || "", excerptEn: post.excerptEn || "", contentDe: post.contentDe || "", contentEn: post.contentEn || "", featuredImage: post.featuredImage || "", status: post.status as "draft" | "published" | "archived", readTimeMinutes: post.readTimeMinutes || 5 }); setEditingId(post.id); setDialogOpen(true);
  }
  function handleSubmit(e: React.FormEvent) { e.preventDefault(); if (editingId) { updateMutation.mutate({ id: editingId, ...form }); } else { createMutation.mutate(form); } }

  const statusColors = { draft: "#8A8A8A", published: "#39FF14", archived: "#FF4444" };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3"><FileText className="w-7 h-7 text-[#39FF14]" /><h1 className="text-3xl font-bold text-foreground font-heading">Blog Posts</h1></div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button onClick={resetForm} className="bg-[#39FF14] text-[#0A0A0A] hover:bg-[#39FF14]/90 font-bold"><Plus size={16} className="mr-1" />{t("Neuer Post", "New Post")}</Button></DialogTrigger>
              <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><div className="flex items-center gap-2"><DialogTitle className="font-heading">{editingId ? t("Post bearbeiten", "Edit Post") : t("Neuer Post", "New Post")}</DialogTitle><AdminHelpButton /></div></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm text-muted-foreground mb-1 block">Slug</label><Input value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} className="bg-muted border-border text-foreground" required /></div>
                    <div><label className="text-sm text-muted-foreground mb-1 block">Status</label><select value={form.status} onChange={(e) => setForm({...form, status: e.target.value as "draft" | "published" | "archived"})} className="w-full h-9 px-3 rounded-md bg-muted border border-border text-foreground text-sm"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
                  </div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Titel (DE)</label><Input value={form.titleDe} onChange={(e) => setForm({...form, titleDe: e.target.value})} className="bg-muted border-border text-foreground" required /></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Titel (EN)</label><Input value={form.titleEn} onChange={(e) => setForm({...form, titleEn: e.target.value})} className="bg-muted border-border text-foreground" required /></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Excerpt (DE)</label><textarea value={form.excerptDe} onChange={(e) => setForm({...form, excerptDe: e.target.value})} className="w-full h-16 px-3 py-2 rounded-md bg-muted border border-border text-foreground text-sm resize-none" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Excerpt (EN)</label><textarea value={form.excerptEn} onChange={(e) => setForm({...form, excerptEn: e.target.value})} className="w-full h-16 px-3 py-2 rounded-md bg-muted border border-border text-foreground text-sm resize-none" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Content (DE) – Markdown + ![alt](url)</label><textarea value={form.contentDe} onChange={(e) => setForm({...form, contentDe: e.target.value})} className="w-full h-32 px-3 py-2 rounded-md bg-muted border border-border text-foreground text-sm font-mono resize-none" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Content (EN)</label><textarea value={form.contentEn} onChange={(e) => setForm({...form, contentEn: e.target.value})} className="w-full h-32 px-3 py-2 rounded-md bg-muted border border-border text-foreground text-sm font-mono resize-none" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Featured Image URL</label><Input value={form.featuredImage} onChange={(e) => setForm({...form, featuredImage: e.target.value})} className="bg-muted border-border text-foreground" placeholder="https://..." /></div>
                  <div><label className="text-sm text-muted-foreground mb-1 block">Read Time (min)</label><Input type="number" value={form.readTimeMinutes} onChange={(e) => setForm({...form, readTimeMinutes: parseInt(e.target.value) || 5})} className="bg-muted border-border text-foreground w-24" /></div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-[#39FF14] text-[#0A0A0A] hover:bg-[#39FF14]/90 font-bold">{editingId ? t("Speichern", "Save") : t("Erstellen", "Create")}</Button>
                    <Button type="button" variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }} className="border-border text-muted-foreground hover:bg-muted">{t("Abbrechen", "Cancel")}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative mb-6 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("Suchen...", "Search...")} className="pl-10 bg-card border-border text-foreground" /></div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">ID</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Titel (DE)</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Slug</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Actions</th>
                </tr></thead>
                <tbody>{blogQuery.data?.posts.map((post) => (
                  <tr key={post.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-muted-foreground">#{post.id}</td>
                    <td className="px-4 py-3 text-foreground">{post.titleDe}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{post.slug}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold" style={{ backgroundColor: `${statusColors[post.status as keyof typeof statusColors]}20`, color: statusColors[post.status as keyof typeof statusColors] }}>{post.status === "published" && <Eye size={10} />}{post.status === "draft" && <EyeOff size={10} />}{post.status === "archived" && <Archive size={10} />}{post.status}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => startEdit(post as unknown as { id: number; slug: string; titleDe: string; titleEn: string; excerptDe: string | null; excerptEn: string | null; contentDe: string | null; contentEn: string | null; featuredImage: string | null; status: string; readTimeMinutes: number | null })} className="p-1.5 rounded text-muted-foreground hover:text-[#39FF14] hover:bg-[#39FF14]/10 transition-colors"><Pencil size={14} /></button><button onClick={() => { if (confirm(t("Wirklich löschen?", "Really delete?"))) deleteMutation.mutate({ id: post.id }); }} className="p-1.5 rounded text-muted-foreground hover:text-[#FF4444] hover:bg-[#FF4444]/10 transition-colors"><Trash2 size={14} /></button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
